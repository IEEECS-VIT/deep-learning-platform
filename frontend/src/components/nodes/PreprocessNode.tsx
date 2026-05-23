"use client";
import { Handle, Position } from "@xyflow/react";

export default function PreprocessNode({ data }: { data: { label: string } }) {
  return (
    <div className="w-[180px] rounded-[12px] border border-[rgba(245,158,11,0.3)] bg-[#1a1500] p-[14px]">
      <div className="flex items-center gap-2 mb-[6px]">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-[#fbbf24] text-[12px]">
          ⚙
        </div>
        <span className="text-[13px] font-semibold text-[#fde68a]">Preprocess</span>
      </div>
      <p className="text-[11px] text-[rgba(251,191,36,0.6)] m-0">Scale and transform data</p>
      <Handle type="target" position={Position.Left} style={{ background: "#f59e0b", width: 10, height: 10, border: "2px solid #1a1500" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#f59e0b", width: 10, height: 10, border: "2px solid #1a1500" }} />
    </div>
  );
}