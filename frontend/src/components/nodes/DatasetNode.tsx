"use client";
import { Handle, Position } from "@xyflow/react";

export default function DatasetNode({ data }: { data: { label: string; dataset?: string } }) {
  return (
    <div className="w-[180px] rounded-[12px] border border-[rgba(139,92,246,0.3)] bg-[#1a1333] p-[14px]">
      <div className="flex items-center gap-2 mb-[6px]">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(139,92,246,0.2)] flex items-center justify-center text-[#a78bfa] text-[12px]">
          ⬡
        </div>
        <span className="text-[13px] font-semibold text-[#ddd6fe]">Dataset</span>
      </div>
      <p className="text-[11px] text-[rgba(167,139,250,0.6)] m-0">Load a dataset</p>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#8b5cf6", width: 10, height: 10, border: "2px solid #1a1333" }}
      />
    </div>
  );
}