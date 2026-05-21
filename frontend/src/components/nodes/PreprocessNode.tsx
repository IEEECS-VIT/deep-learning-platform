"use client";
import { Handle, Position } from "@xyflow/react";

export default function PreprocessNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ width: 180, borderRadius: 12, border: "1px solid rgba(245,158,11,0.3)", background: "#1a1500", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", fontSize: 12 }}>⚙</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#fde68a" }}>Preprocess</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(251,191,36,0.6)", margin: 0 }}>Scale and transform data</p>
      <Handle type="target" position={Position.Left} style={{ background: "#f59e0b", width: 10, height: 10, border: "2px solid #1a1500" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#f59e0b", width: 10, height: 10, border: "2px solid #1a1500" }} />
    </div>
  );
}