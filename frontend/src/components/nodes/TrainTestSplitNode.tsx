"use client";
import { Handle, Position } from "@xyflow/react";

export default function TrainTestSplitNode({ data }: { data: { label: string; testSize?: string } }) {
  const meta = data.testSize ? `Split data (test: ${data.testSize})` : "Split data into train/test sets";

  return (
    <div className="w-[180px] rounded-[12px] border border-[rgba(99,102,241,0.3)] bg-[#0f1333] p-[14px]">
      <div className="flex items-center gap-2 mb-[6px]">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(99,102,241,0.2)] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-[#c7d2fe]">Train-Test Split</span>
      </div>
      <p className="text-[11px] text-[rgba(129,140,248,0.6)] m-0">{meta}</p>
      <Handle type="target" position={Position.Left} style={{ background: "#6366f1", width: 10, height: 10, border: "2px solid #0f1333" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#6366f1", width: 10, height: 10, border: "2px solid #0f1333" }} />
    </div>
  );
}