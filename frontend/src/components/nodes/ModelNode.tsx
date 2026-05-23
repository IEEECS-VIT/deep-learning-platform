"use client";
import { Handle, Position } from "@xyflow/react";

export default function ModelNode({ data }: { data: { label: string } }) {
  return (
    <div className="w-[180px] rounded-[12px] border border-[rgba(16,185,129,0.3)] bg-[#001a0f] p-[14px]">
      <div className="flex items-center gap-2 mb-[6px]">
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-[#34d399] text-[12px]">
          ◈
        </div>
        <span className="text-[13px] font-semibold text-[#a7f3d0]">Model</span>
      </div>
      <p className="text-[11px] text-[rgba(52,211,153,0.6)] m-0">Train a ML model</p>
      <Handle type="target" position={Position.Left} style={{ background: "#10b981", width: 10, height: 10, border: "2px solid #001a0f" }} />
    </div>
  );
}