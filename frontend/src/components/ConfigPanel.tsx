"use client";
import type { Node } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { usePipelineStore } from "../store/pipelineStore";
import {
  areConfigsEqual,
  normalizeConfig,
  type ConfigFieldSchema,
  type ConfigSchemaMap,
  type NodeMetadataEntry,
} from "@/lib/configSchema";
import { mergeSchemaExtensions } from "@/lib/schemaExtensions";
import { buildDatasetGroups, formatDatasetLabel } from "@/lib/datasetGroups";

interface ConfigPanelProps {
  nodeMetadata: Record<string, NodeMetadataEntry>;
}

const getConfigValue = (
  schema: ConfigSchemaMap,
  config: Record<string, unknown>,
  key: string,
) => {
  if (Object.prototype.hasOwnProperty.call(config, key)) return config[key];
  return schema[key]?.default;
};

const shouldRenderField = (
  schema: ConfigSchemaMap,
  field: ConfigFieldSchema,
  config: Record<string, unknown>,
) => {
  if (!field.visible_if) return true;
  return Object.entries(field.visible_if).every(([key, allowed]) => {
    const currentValue = getConfigValue(schema, config, key);
    if (Array.isArray(allowed)) return allowed.includes(currentValue);
    return currentValue === allowed;
  });
};

export default function ConfigPanel({ nodeMetadata }: ConfigPanelProps) {
  const { nodes, selectedNodeId, updateNodeConfig } = usePipelineStore();
  const selectedNode = nodes.find((node: Node) => node.id === selectedNodeId);
  const rawSchema = selectedNode?.type
    ? nodeMetadata[selectedNode.type]?.config_schema
    : undefined;
  const configSchema = useMemo(() => {
    if (!selectedNode?.type || !rawSchema) return undefined;
    return mergeSchemaExtensions(
      selectedNode.type,
      rawSchema as ConfigSchemaMap,
    );
  }, [selectedNode?.type, rawSchema]);
  const nodeConfig =
    ((selectedNode?.data as { config?: Record<string, unknown> } | undefined)
      ?.config as Record<string, unknown>) ?? {};
  const resolvedConfig = configSchema
    ? normalizeConfig(configSchema, nodeConfig)
    : nodeConfig;
  const visibleConfigEntries = configSchema
    ? Object.entries(configSchema).filter(([, field]) =>
        shouldRenderField(configSchema, field, {
          ...nodeConfig,
          ...resolvedConfig,
        }),
      )
    : [];

  useEffect(() => {
    if (!selectedNode || !configSchema) return;
    const nextConfig = normalizeConfig(configSchema, nodeConfig);
    if (!areConfigsEqual(nextConfig, nodeConfig)) {
      updateNodeConfig(selectedNode.id, nextConfig, { replace: true });
    }
  }, [selectedNodeId, selectedNode?.type, configSchema, nodeConfig, updateNodeConfig]);

  const handleConfigChange = (key: string, value: unknown) => {
    if (!selectedNode) return;
    if (!configSchema) {
      updateNodeConfig(selectedNode.id, { [key]: value });
      return;
    }
    const nextConfig = normalizeConfig(configSchema, {
      ...nodeConfig,
      [key]: value,
    });
    updateNodeConfig(selectedNode.id, nextConfig, { replace: true });
  };

  const inputClassName =
    "w-full bg-[#14141a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30";
  const optionClassName = "bg-[#1a1a1f] text-white";
  const helperClassName = "text-[11px] text-white/40";

  const renderSelectField = (
    key: string,
    field: ConfigFieldSchema,
    resolvedValue: unknown,
    label: string,
  ) => {
    const options = field.options ?? [];
    const isDatasetField =
      selectedNode?.type === "dataset" && key === "dataset" && options.length > 0;
    const groups = isDatasetField ? buildDatasetGroups(options) : null;

    if (groups && groups.length > 0) {
      return (
        <select
          value={(resolvedValue as string | undefined) ?? ""}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className={inputClassName}
        >
          <option value="" className={optionClassName}>
            Select dataset
          </option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option} value={option} className={optionClassName}>
                  {formatDatasetLabel(option)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      );
    }

    return (
      <select
        value={(resolvedValue as string | undefined) ?? ""}
        onChange={(e) => handleConfigChange(key, e.target.value)}
        className={inputClassName}
      >
        <option value="" className={optionClassName}>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className={optionClassName}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    );
  };

  const renderField = (
    key: string,
    field: ConfigFieldSchema,
    resolvedValue: unknown,
  ) => {
    const fieldType = field.type ?? "string";
    const hasOptions = Array.isArray(field.options) && field.options.length > 0;
    const label = field.label ?? key;
    const minValue = typeof field.min === "number" ? field.min : undefined;
    const maxValue = typeof field.max === "number" ? field.max : undefined;
    const showRange = typeof minValue === "number" && typeof maxValue === "number";

    if (fieldType === "boolean") {
      return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#14141a] px-3 py-2">
          <span className="text-sm text-white">{label}</span>
          <input
            type="checkbox"
            checked={Boolean(resolvedValue ?? false)}
            onChange={(e) => handleConfigChange(key, e.target.checked)}
            className="h-4 w-4 rounded border border-white/20 bg-[#0f0f13] accent-violet-500"
          />
        </label>
      );
    }

    if (hasOptions) {
      return renderSelectField(key, field, resolvedValue, label);
    }

    if (fieldType === "integer" || fieldType === "float") {
      const step = fieldType === "integer" ? 1 : "any";
      const numericValue =
        typeof resolvedValue === "number" ? resolvedValue : undefined;
      return (
        <div className="flex flex-col gap-2">
          {showRange ? (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={minValue}
                max={maxValue}
                step={step}
                value={numericValue ?? minValue ?? 0}
                onChange={(e) => handleConfigChange(key, Number(e.target.value))}
                className="flex-1 accent-violet-500 cursor-pointer"
              />
              <input
                type="number"
                step={step}
                min={minValue}
                max={maxValue}
                value={
                  typeof numericValue === "number" ? String(numericValue) : ""
                }
                onChange={(e) =>
                  handleConfigChange(
                    key,
                    e.target.value === ""
                      ? undefined
                      : fieldType === "integer"
                        ? Number.parseInt(e.target.value, 10)
                        : Number.parseFloat(e.target.value),
                  )
                }
                placeholder={
                  field.default !== undefined ? String(field.default) : ""
                }
                className="w-28 bg-[#14141a] border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-violet-500/70"
              />
            </div>
          ) : (
            <input
              type="number"
              step={step}
              min={minValue}
              max={maxValue}
              value={
                typeof numericValue === "number" ? String(numericValue) : ""
              }
              onChange={(e) =>
                handleConfigChange(
                  key,
                  e.target.value === ""
                    ? undefined
                    : fieldType === "integer"
                      ? Number.parseInt(e.target.value, 10)
                      : Number.parseFloat(e.target.value),
                )
              }
              placeholder={
                field.default !== undefined ? String(field.default) : ""
              }
              className={inputClassName}
            />
          )}
          {showRange && (
            <div className={helperClassName}>
              Range: {minValue} – {maxValue}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type="text"
        value={(resolvedValue as string | undefined) ?? ""}
        onChange={(e) => handleConfigChange(key, e.target.value)}
        placeholder={field.default !== undefined ? String(field.default) : ""}
        className={inputClassName}
      />
    );
  };

  const displayName =
    selectedNode?.type && nodeMetadata[selectedNode.type]?.display_name
      ? nodeMetadata[selectedNode.type].display_name
      : selectedNode?.type?.replace(/_/g, " ");

  return (
    <div className="w-full h-full p-4 text-white overflow-y-auto">
      {!selectedNode ? (
        <p className="text-white/40 text-sm">Select a node to configure</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Node Type</p>
            <p className="text-sm font-semibold capitalize">{displayName}</p>
            {selectedNode.type && nodeMetadata[selectedNode.type]?.description && (
              <p className="text-[11px] text-white/40 mt-1">
                {nodeMetadata[selectedNode.type].description}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2">Current Config</p>
            <pre className="bg-[#1a1a1f] p-3 rounded-lg text-xs overflow-x-auto mb-4">
              {JSON.stringify(resolvedConfig, null, 2)}
            </pre>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-xs text-white/40">Configuration Fields</p>
            {configSchema && visibleConfigEntries.length === 0 && (
              <p className="text-[12px] text-white/40">
                No configurable fields for this node.
              </p>
            )}
            {configSchema &&
              visibleConfigEntries.map(([key, field]) => {
                const typedField = field as ConfigFieldSchema;
                const resolvedValue =
                  resolvedConfig[key] ?? typedField.default;
                const label = typedField.label ?? key;
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#111117] p-3"
                  >
                    <label className="text-sm font-medium text-white/90">
                      {label}
                    </label>
                    {renderField(key, typedField, resolvedValue)}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
