"use client";
import type { Node } from "@xyflow/react";
import { useEffect } from "react";
import { usePipelineStore } from "../store/pipelineStore";

interface ConfigPanelProps {
  nodeMetadata: Record<string, unknown>;
}

type ConfigFieldSchema = {
  type?: string;
  label?: string;
  options?: string[];
  default?: unknown;
  min?: number;
  max?: number;
  visible_if?: Record<string, unknown[] | unknown>;
};

type ConfigSchemaMap = Record<string, ConfigFieldSchema>;

const areConfigsEqual = (left: Record<string, unknown>, right: Record<string, unknown>) => {
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== Object.keys(right).length) return false;
  return leftKeys.every((key) => Object.is(left[key], right[key]));
};

const getConfigValue = (
  schema: ConfigSchemaMap,
  config: Record<string, unknown>,
  key: string,
) => {
  if (Object.prototype.hasOwnProperty.call(config, key)) return config[key];
  const field = schema[key];
  return field?.default;
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

const normalizeConfig = (schema: ConfigSchemaMap, config: Record<string, unknown>) => {
  const nextConfig: Record<string, unknown> = {};
  Object.entries(schema).forEach(([key, field]) => {
    if (!shouldRenderField(schema, field, config)) return;
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      nextConfig[key] = config[key];
      return;
    }
    if (field.default !== undefined) {
      nextConfig[key] = field.default;
    }
  });
  return nextConfig;
};

export default function ConfigPanel({ nodeMetadata }: ConfigPanelProps) {
  const { nodes, selectedNodeId, updateNodeConfig } = usePipelineStore();
  const selectedNode = nodes.find((node: Node) => node.id === selectedNodeId);
  const selectedNodeMetadata = selectedNode?.type
    ? (nodeMetadata[selectedNode.type] as Record<string, unknown>)
    : null;
  const configSchema = (selectedNodeMetadata as { config_schema?: ConfigSchemaMap } | null)?.config_schema;
  const nodeConfig =
    ((selectedNode?.data as { config?: Record<string, unknown> } | undefined)?.config as Record<string, unknown>) ?? {};
  const resolvedConfig = configSchema
    ? normalizeConfig(configSchema, nodeConfig)
    : nodeConfig;
  const visibleConfigEntries = configSchema
    ? Object.entries(configSchema).filter(([, field]) =>
        shouldRenderField(configSchema, field, { ...nodeConfig, ...resolvedConfig }),
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
    const nextConfig = normalizeConfig(configSchema, { ...nodeConfig, [key]: value });
    updateNodeConfig(selectedNode.id, nextConfig, { replace: true });
  };

  const inputClassName = "w-full bg-[#14141a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30";
  const optionClassName = "bg-[#1a1a1f] text-white";
  const helperClassName = "text-[11px] text-white/40";

  const renderField = (key: string, field: ConfigFieldSchema, resolvedValue: unknown) => {
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
      return (
        <select
          value={(resolvedValue as string | undefined) ?? ""}
          onChange={(e) => handleConfigChange(key, e.target.value)}
          className={inputClassName}
        >
          <option value="" className={optionClassName}>Select option</option>
          {field.options?.map((option) => (
            <option key={option} value={option} className={optionClassName}>{option}</option>
          ))}
        </select>
      );
    }

    if (fieldType === "integer" || fieldType === "float") {
      const step = fieldType === "integer" ? 1 : "any";
      const numericValue = typeof resolvedValue === "number" ? resolvedValue : undefined;
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
                value={typeof numericValue === "number" ? String(numericValue) : ""}
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
                placeholder={field.default !== undefined ? String(field.default) : ""}
                className="w-28 bg-[#14141a] border border-white/10 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-violet-500/70"
              />
            </div>
          ) : (
            <input
              type="number"
              step={step}
              min={minValue}
              max={maxValue}
              value={typeof numericValue === "number" ? String(numericValue) : ""}
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
              placeholder={field.default !== undefined ? String(field.default) : ""}
              className={inputClassName}
            />
          )}
          {showRange && (
            <div className={helperClassName}>Range: {minValue} – {maxValue}</div>
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

  return (
    <div className="w-full h-full p-4 text-white overflow-y-auto">
      {!selectedNode ? (
        <p className="text-white/40 text-sm">Select a node to configure</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Node Type</p>
            <p className="text-sm font-semibold capitalize">{selectedNode.type?.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2">Current Config</p>
            <pre className="bg-[#1a1a1f] p-3 rounded-lg text-xs overflow-x-auto mb-4">
              {JSON.stringify(resolvedConfig, null, 2)}
            </pre>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-xs text-white/40">Configuration Fields</p>
            {configSchema && visibleConfigEntries.map(([key, field]) => {
              const typedField = field as ConfigFieldSchema;
              const resolvedValue = resolvedConfig[key] ?? typedField.default;
              const label = typedField.label ?? key;
              return (
                <div key={key} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-[#111117] p-3">
                  <label className="text-sm font-medium text-white/90">{label}</label>
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