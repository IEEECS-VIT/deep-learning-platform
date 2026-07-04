"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getNodePresentation, getConfigSummary } from "@/lib/nodePresentation";
import { useSettingsStore } from "@/store/settingsStore";

type PipelineNodeData = {
  label?: string;
  config?: Record<string, unknown>;
  hasError?: boolean;
};

export default function BasePipelineNode({ type, data }: NodeProps) {
  const nodeType = type ?? "generic";
  const nodeData = (data ?? {}) as PipelineNodeData;
  const presentation = getNodePresentation(nodeType);
  const summary = getConfigSummary(nodeType, nodeData.config ?? {});
  const showNodeLabels = useSettingsStore(
    (state) => state.settings.showNodeLabels,
  );
  const showNodeSummaries = useSettingsStore(
    (state) => state.settings.showNodeSummaries,
  );
  const hasError = Boolean(nodeData.hasError);
  const hasInputs = nodeType !== "dataset";
  const hasOutputs = nodeType !== "model" && nodeType !== "neural_network";

  return (
    <div
      className={`w-[190px] rounded-[12px] border p-[14px] transition-shadow ${
        hasError
          ? "border-red-500/70 shadow-[0_0_0_2px_rgba(239,68,68,0.35)]"
          : ""
      }`}
      style={{
        borderColor: hasError ? undefined : presentation.border,
        background: presentation.bg.replace("0.12)", "0.18)"),
      }}
    >
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: presentation.color,
            width: 10,
            height: 10,
            border: `2px solid ${presentation.bg}`,
          }}
        />
      )}
      <div
        className={`flex items-center gap-2 ${showNodeLabels ? "mb-[6px]" : "justify-center"}`}
      >
        <div
          className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[12px] font-semibold"
          style={{
            background: `${presentation.color}33`,
            color: presentation.color,
          }}
        >
          {presentation.icon === "neural" ? "NN" : presentation.label.charAt(0)}
        </div>
        {showNodeLabels && (
          <span
            className="text-[13px] font-semibold truncate"
            style={{ color: presentation.color }}
          >
            {presentation.label}
          </span>
        )}
      </div>
      {showNodeSummaries && (
        <p
          className="text-[11px] m-0 truncate"
          style={{ color: `${presentation.color}99` }}
        >
          {summary ?? presentation.desc}
        </p>
      )}
      {hasError && (
        <p className="text-[10px] text-red-400 mt-1.5 m-0 font-medium">
          Validation error
        </p>
      )}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: presentation.color,
            width: 10,
            height: 10,
            border: `2px solid ${presentation.bg}`,
          }}
        />
      )}
    </div>
  );
}
