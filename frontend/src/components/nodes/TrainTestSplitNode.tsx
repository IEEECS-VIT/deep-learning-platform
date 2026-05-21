"use client";
import { Handle, Position } from "@xyflow/react";

export default function TrainTestSplitNode({ data }: { data: { label: string; testSize?: string } }) {
  return (
    <div style={{ width: 180, borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)", background: "#0f1333", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe" }}>Train-Test Split</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(129,140,248,0.6)", margin: 0 }}>Split data into train and test sets</p>
      {data.testSize && (
        <p style={{ fontSize: 11, color: "#818cf8", margin: "6px 0 0", background: "rgba(99,102,241,0.1)", borderRadius: 6, padding: "3px 8px" }}>Test Size: {data.testSize}</p>
      )}
      <Handle type="target" position={Position.Left} style={{ background: "#6366f1", width: 10, height: 10, border: "2px solid #0f1333" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#6366f1", width: 10, height: 10, border: "2px solid #0f1333" }} />
    </div>
  );
}