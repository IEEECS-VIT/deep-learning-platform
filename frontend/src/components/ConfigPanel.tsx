"use client";
import type { Node } from "@xyflow/react";
import { useEffect } from "react";
import { usePipelineStore } from "../store/pipelineStore";

interface ConfigPanelProps {
  nodeMetadata: Record<string, unknown>;
}

type ConfigFieldSchema = {
  type?: string;
  options?: string[];
  default?: string;
};

type ConfigSchemaMap = Record<string, ConfigFieldSchema>;

const MODEL_FIELD_MAP: Record<string, string[]> = {
  linear_regression: ["fit_intercept"],
  logistic_regression: ["C", "solver"],
  decision_tree: ["criterion", "max_depth"],
  random_forest: ["n_estimators", "max_depth"],
};

const MODEL_DEFAULT_CONFIGS: Record<string, Record<string, unknown>> = {
  linear_regression: { fit_intercept: true },
  logistic_regression: { C: 1.0, solver: "lbfgs" },
  decision_tree: { criterion: "gini", max_depth: 5 },
  random_forest: { n_estimators: 100, max_depth: 5 },
};

const buildModelConfig = (
  algorithm: string,
  existingConfig: Record<string, unknown>,
  options?: { useExistingValues?: boolean },
) => {
  const allowedFields = MODEL_FIELD_MAP[algorithm] ?? [];
  const defaults = MODEL_DEFAULT_CONFIGS[algorithm] ?? {};
  const nextConfig: Record<string, unknown> = { algorithm };

  allowedFields.forEach((field) => {
    if (options?.useExistingValues && field in existingConfig) {
      nextConfig[field] = existingConfig[field];
      return;
    }
    if (field in defaults) {
      nextConfig[field] = defaults[field];
    }
  });

  return nextConfig;
};

const areConfigsEqual = (left: Record<string, unknown>, right: Record<string, unknown>) => {
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== Object.keys(right).length) return false;
  return leftKeys.every((key) => Object.is(left[key], right[key]));
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
  const isModelNode = selectedNode?.type === "model";
  const modelAlgorithm = isModelNode
    ? (nodeConfig.algorithm as string | undefined) ??
      ((configSchema?.algorithm as ConfigFieldSchema | undefined)?.default as string | undefined)
    : undefined;
  const filteredConfigEntries = configSchema
    ? Object.entries(configSchema).filter(([key]) => {
        if (!isModelNode) return true;
        if (key === "algorithm") return true;
        const allowedFields = modelAlgorithm ? MODEL_FIELD_MAP[modelAlgorithm] ?? [] : [];
        return allowedFields.includes(key);
      })
    : [];
  const orderedConfigEntries = isModelNode
    ? [...filteredConfigEntries].sort(([leftKey], [rightKey]) => {
        if (leftKey === "algorithm") return -1;
        if (rightKey === "algorithm") return 1;
        return 0;
      })
    : filteredConfigEntries;
  const resolvedConfig = configSchema
    ? Object.fromEntries(
        orderedConfigEntries.map(([key, field]) => {
          const typedField = field as ConfigFieldSchema;
          return [key, nodeConfig[key] ?? typedField.default];
        })
      )
    : nodeConfig;

  useEffect(() => {
    if (!selectedNode || !isModelNode || !modelAlgorithm) return;
    const nextConfig = buildModelConfig(modelAlgorithm, nodeConfig, { useExistingValues: true });
    if (!areConfigsEqual(nextConfig, nodeConfig)) {
      updateNodeConfig(selectedNode.id, nextConfig, { replace: true });
    }
  }, [selectedNode, isModelNode, modelAlgorithm, nodeConfig, updateNodeConfig]);

  const handleConfigChange = (key: string, value: unknown) => {
    if (!selectedNode) return;
    if (isModelNode && key === "algorithm" && typeof value === "string") {
      updateNodeConfig(selectedNode.id, buildModelConfig(value, {}, { useExistingValues: false }), { replace: true });
      return;
    }
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  const inputClassName = "w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500";
  const optionClassName = "bg-[#1a1a1f] text-white";

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
            {configSchema && orderedConfigEntries.map(([key, field]) => {
              const typedField = field as ConfigFieldSchema;
              const resolvedValue = nodeConfig[key] ?? typedField.default;
              const fieldType = typedField.type ?? "string";
              const hasOptions = Array.isArray(typedField.options) && typedField.options.length > 0;
              return (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-sm text-white">{key}</label>
                  {fieldType === "boolean" ? (
                    <label className="flex items-center gap-2 text-sm text-white">
                      <input type="checkbox" checked={Boolean(resolvedValue ?? false)}
                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                        className="h-4 w-4 rounded border border-white/20 bg-[#1a1a1f]" />
                      {String(key)}
                    </label>
                  ) : hasOptions ? (
                    <select value={(resolvedValue as string | undefined) ?? ""}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className={inputClassName}>
                      <option value="" className={optionClassName}>Select option</option>
                      {typedField.options?.map((option) => (
                        <option key={option} value={option} className={optionClassName}>{option}</option>
                      ))}
                    </select>
                  ) : fieldType === "integer" ? (
                    <input type="number" step="1"
                      value={typeof resolvedValue === "number" ? String(resolvedValue) : ""}
                      onChange={(e) => handleConfigChange(key, e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10))}
                      placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                      className={inputClassName} />
                  ) : fieldType === "float" ? (
                    <input type="number" step="any"
                      value={typeof resolvedValue === "number" ? String(resolvedValue) : ""}
                      onChange={(e) => handleConfigChange(key, e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                      placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                      className={inputClassName} />
                  ) : (
                    <input type="text"
                      value={(resolvedValue as string | undefined) ?? ""}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                      className={inputClassName} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}