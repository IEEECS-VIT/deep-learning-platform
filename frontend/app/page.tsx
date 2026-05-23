"use client";
import { useEffect, useState } from "react";
import Canvas from "@/components/Canvas";
import Sidebar from "@/components/Sidebar";
import { usePipelineStore } from "@/store/pipelineStore";
import { runPipeline, getNodes } from "@/lib/api";
import ConfigPanel from "@/components/ConfigPanel";

export default function Home() {
  const { nodes, edges } = usePipelineStore();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nodeMetadata, setNodeMetadata] = useState<Record<string, unknown>>({});

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as string,
          config:
            ((n.data as { config?: Record<string, unknown> } | undefined)?.config as Record<string, unknown>) ?? {},
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

  useEffect(() => {
    const fetchNodeMetadata = async () => {
      try {
        const metadata =
          await getNodes();
        setNodeMetadata(metadata);
      } catch (error) {
        console.error(
          "Failed to fetch metadata:",
          error
        );
      }
    };
    fetchNodeMetadata();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11] overflow-hidden">
      {/* Topbar */}
      <div className="h-13 bg-[#0f0f11] border-b border-white/[0.07] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="text-white text-[15px] font-semibold">ML Workflow Builder</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-8 px-3.5 rounded-md border border-white/10 bg-transparent text-white/60 cursor-pointer text-[12px] flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className={`h-8.5 px-4.5 rounded-lg border-0 text-white text-[13px] font-semibold flex items-center gap-1.75 ${
              running
                ? "bg-[#5b21b6] cursor-not-allowed opacity-80"
                : "bg-[#7c3aed] cursor-pointer"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {running ? "Running..." : "Run Pipeline"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon rail */}
        <div className="w-16 bg-[#0a0a0c] border-r border-white/6 flex flex-col items-center pt-3 gap-1 shrink-0">
          {[
            {
              label: "Nodes",
              svg: (
                <>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </>
              ),
            },
            {
              label: "Workflows",
              svg: (
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              ),
            },
            {
              label: "Runs",
              svg: <polygon points="5 3 19 12 5 21 5 3" />,
            },
            {
              label: "History",
              svg: (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </>
              ),
            },
            {
              label: "Settings",
              svg: (
                <>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </>
              ),
            },
          ].map((item, i) => (
            <button
              key={item.label}
              className={`w-13 py-2 rounded-lg border-0 flex flex-col items-center gap-1 ${
                i === 0
                  ? "bg-[rgba(124,58,237,0.15)] text-[#a78bfa]"
                  : "bg-transparent text-white/35"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {item.svg}
              </svg>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main canvas + output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas />
          </div>

          {/* Output panel — only shows after run */}
          {(result || error) && (
            <div className="h-50 bg-[#111114] border-t border-white/[0.07] px-5 py-3.5 overflow-y-auto shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-semibold text-white">Output</span>
                {result && (
                  <span className="text-[11px] bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(16,185,129,0.2)] rounded-[20px] px-2.5 py-0.5">
                    Success
                  </span>
                )}
                {error && (
                  <span className="text-[11px] bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.2)] rounded-[20px] px-2.5 py-0.5">
                    Error
                  </span>
                )}
              </div>
              {error && <p className="text-[#f87171] text-[12px] m-0">{error}</p>}
              {result && (
                <pre className="text-[#a3e635] text-[11px] m-0 whitespace-pre-wrap break-all">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
        <ConfigPanel nodeMetadata={nodeMetadata}/>
      </div>
    </div>
  );
}