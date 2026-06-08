"use client";
import { usePipelineStore } from "@/store/pipelineStore";
import { useOutputStore } from "@/store/outputStore";

export default function ValidationErrorBanner() {
  const { error, errorNodeId, errorNodeType } = useOutputStore();
  const nodes = usePipelineStore((state) => state.nodes);

  if (!error) return null;

  const errorNode = errorNodeId
    ? nodes.find((n) => n.id === errorNodeId)
    : null;
  const nodeLabel =
    (errorNode?.data as { label?: string } | undefined)?.label ??
    errorNodeId ??
    "Unknown node";
  const nodeTypeLabel =
    errorNodeType ?? errorNode?.type ?? "unknown";

  return (
    <div className="rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-3 space-y-2">
      <div className="flex items-start gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f87171"
          strokeWidth="2"
          className="shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#f87171]">
            Pipeline validation failed
          </p>
          <p className="text-[12px] text-[#fca5a5] mt-1">{error}</p>
        </div>
      </div>
      {(errorNodeId || errorNodeType) && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-red-300">
            Node: {nodeLabel}
          </span>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-red-300 capitalize">
            Type: {nodeTypeLabel.replace(/_/g, " ")}
          </span>
        </div>
      )}
    </div>
  );
}
