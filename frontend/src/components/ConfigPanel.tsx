"use client";
import type { Node } from "@xyflow/react";
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
    ? Object.fromEntries(
        Object.entries(configSchema).map(([key, field]) => {
          const typedField = field as ConfigFieldSchema;
          return [key, nodeConfig[key] ?? typedField.default];
        })
      )
    : nodeConfig;
  const handleConfigChange = (key: string, value: unknown) => {
    if (!selectedNode) return;
    updateNodeConfig(selectedNode.id, { [key]: value });
  };
  const inputClassName =
    "w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-violet-500";
  const optionClassName = "bg-[#1a1a1f] text-white";

  return (
    <div className="w-80 bg-[#111114] border-l border-white/5 p-4 text-white overflow-y-auto">
      <h2 className="text-base font-semibold mb-4">Configuration</h2>
      {!selectedNode ? (
        <p className="text-white/40 text-sm">Select a node to configure</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Node Type</p>
            <p className="text-sm font-semibold">{selectedNode.type}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2">Current Config</p>
            <pre className="bg-[#1a1a1f] p-3 rounded-lg text-xs overflow-x-auto mb-4">
              {JSON.stringify(resolvedConfig, null, 2)}
            </pre>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-xs text-white/40">Configuration Fields</p>
            {configSchema &&
              Object.entries(configSchema).map(([key, field]) => {
                const typedField = field as ConfigFieldSchema;
                const resolvedValue = nodeConfig[key] ?? typedField.default;
                const fieldType = typedField.type ?? "string";
                const hasOptions = Array.isArray(typedField.options) && typedField.options.length > 0;

                return (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-sm text-white">{key}</label>
                    {fieldType === "boolean" ? (
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={Boolean(resolvedValue ?? false)}
                          onChange={(e) => handleConfigChange(key, e.target.checked)}
                          className="h-4 w-4 rounded border border-white/20 bg-[#1a1a1f]"
                        />
                        {String(key)}
                      </label>
                    ) : hasOptions ? (
                      <select
                        value={(resolvedValue as string | undefined) ?? ""}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className={inputClassName}
                      >
                        <option value="" className={optionClassName}>
                          Select option
                        </option>
                        {typedField.options?.map((option) => (
                          <option key={option} value={option} className={optionClassName}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : fieldType === "integer" ? (
                      <input
                        type="number"
                        step="1"
                        value={typeof resolvedValue === "number" ? String(resolvedValue) : ""}
                        onChange={(e) =>
                          handleConfigChange(
                            key,
                            e.target.value === "" ? undefined : Number.parseInt(e.target.value, 10)
                          )
                        }
                        placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                        className={inputClassName}
                      />
                    ) : fieldType === "float" ? (
                      <input
                        type="number"
                        step="any"
                        value={typeof resolvedValue === "number" ? String(resolvedValue) : ""}
                        onChange={(e) =>
                          handleConfigChange(
                            key,
                            e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                          )
                        }
                        placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                        className={inputClassName}
                      />
                    ) : (
                      <input
                        type="text"
                        value={(resolvedValue as string | undefined) ?? ""}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={typedField.default !== undefined ? String(typedField.default) : ""}
                        className={inputClassName}
                      />
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