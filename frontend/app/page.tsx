"use client";
import { useState } from "react";
import Canvas from "@/components/Canvas";
import Sidebar from "@/components/Sidebar";
import { usePipelineStore } from "@/store/pipelineStore";
import { runPipeline } from "@/lib/api";

export default function Home() {
  const { nodes, edges } = usePipelineStore();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as string,
          config: n.type === "model" 
            ? { algorithm: "logistic_regression" }
            : n.type === "dataset"
            ? { dataset: "iris" }
            : n.type === "train_test_split"
            ? { test_size: 0.2, random_state: 42 }
            : n.type === "preprocess"
            ? { scale_factor: 1 }
            : {},
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
      };
      const res = await runPipeline(payload);
      setResult(res.results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", background: "#0f0f11", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>

      {/* Topbar */}
      <div style={{ height: 52, background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <span style={{ color: "white", fontSize: 15, fontWeight: 600 }}>ML Workflow Builder</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ height: 32, padding: "0 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            style={{ height: 34, padding: "0 18px", borderRadius: 8, border: "none", background: running ? "#5b21b6" : "#7c3aed", color: "white", fontSize: 13, cursor: running ? "not-allowed" : "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, opacity: running ? 0.8 : 1 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {running ? "Running..." : "Run Pipeline"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Icon rail */}
        <div style={{ width: 64, background: "#0a0a0c", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
          {[
            { label: "Nodes", svg: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
            { label: "Workflows", svg: <><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></> },
            { label: "Runs", svg: <><polygon points="5 3 19 12 5 21 5 3"/></> },
            { label: "History", svg: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
            { label: "Settings", svg: <><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></> },
          ].map((item, i) => (
            <button key={item.label} style={{ width: 52, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: "none", background: i === 0 ? "rgba(124,58,237,0.15)" : "transparent", color: i === 0 ? "#a78bfa" : "rgba(255,255,255,0.35)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.svg}</svg>
              <span style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main canvas + output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Canvas */}
          <div style={{ flex: 1, position: "relative" }}>
            <Canvas />
          </div>

          {/* Output panel — only shows after run */}
          {(result || error) && (
            <div style={{ height: 200, background: "#111114", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 20px", overflowY: "auto", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Output</span>
                {result && <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "2px 10px" }}>Success</span>}
                {error && <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: "2px 10px" }}>Error</span>}
              </div>
              {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
              {result && (
                <pre style={{ color: "#a3e635", fontSize: 11, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}