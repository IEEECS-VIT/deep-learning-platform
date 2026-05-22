"use client";
import { Handle, Position } from "@xyflow/react";

export default function ModelNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ width: 180, borderRadius: 12, border: "1px solid rgba(16,185,129,0.3)", background: "#001a0f", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", fontSize: 12 }}>◈</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#a7f3d0" }}>Model</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(52,211,153,0.6)", margin: 0 }}>Train a ML model</p>
      <Handle type="target" position={Position.Left} style={{ background: "#10b981", width: 10, height: 10, border: "2px solid #001a0f" }} />
    </div>
  );
}