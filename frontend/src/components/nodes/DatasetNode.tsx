"use client";
import { Handle, Position } from "@xyflow/react";

export default function DatasetNode({ data }: { data: { label: string; dataset?: string } }) {
  return (
    <div style={{ width: 180, borderRadius: 12, border: "1px solid rgba(139,92,246,0.3)", background: "#1a1333", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontSize: 12 }}>⬡</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd6fe" }}>Dataset</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(167,139,250,0.6)", margin: 0 }}>Load a dataset</p>
      <Handle type="source" position={Position.Right} style={{ background: "#8b5cf6", width: 10, height: 10, border: "2px solid #1a1333" }} />
    </div>
  );
}