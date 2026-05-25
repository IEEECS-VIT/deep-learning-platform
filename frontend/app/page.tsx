"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Canvas from "@/components/Canvas";
import Sidebar from "@/components/Sidebar";
import { usePipelineStore } from "@/store/pipelineStore";
import { runPipeline, getNodes } from "@/lib/api";
import ConfigPanel from "@/components/ConfigPanel";
import OutputPanel from "@/components/output/OutputPanel";
import { useOutputStore } from "@/store/outputStore";

const SIDEBAR_WIDTH = 260;
const MIN_CONFIG = 240;
const MAX_CONFIG = 460;
const MIN_OUTPUT = 120;
const MAX_OUTPUT = 1200;

export default function Home() {
  const {
    nodes,
    edges,
    undo,
    redo,
    past,
    future,
    selectedNodeId,
    selectedEdgeId,
    deleteNode,
    deleteEdge,
  } = usePipelineStore();
  const [nodeMetadata, setNodeMetadata] = useState<Record<string, unknown>>({});
  const {
    loading,
    latestResult,
    startExecution,
    setExecutionResult,
    setExecutionError,
    saveRun,
  } = useOutputStore();

  const [configWidth, setConfigWidth] = useState(300);
  const [outputHeight, setOutputHeight] = useState(280);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);
  const [outputOpen, setOutputOpen] = useState(true);
  const [canvasName, setCanvasName] = useState("Untitled Workflow");
  const [editingName, setEditingName] = useState(false);
  const [isDragging, setIsDragging] = useState<"config" | "output" | null>(
    null,
  );
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [saveButtonState, setSaveButtonState] = useState<"idle" | "saved">(
    "idle",
  );

  const dragging = useRef<"config" | "output" | null>(null);
  const startPos = useRef(0);
  const startSize = useRef(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    if (dragging.current === "config") {
      setConfigWidth(
        Math.min(
          MAX_CONFIG,
          Math.max(
            MIN_CONFIG,
            startSize.current + (startPos.current - e.clientX),
          ),
        ),
      );
    } else if (dragging.current === "output") {
      setOutputHeight(
        Math.min(
          MAX_OUTPUT,
          Math.max(
            MIN_OUTPUT,
            startSize.current + (startPos.current - e.clientY),
          ),
        ),
      );
    }
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = null;
    setIsDragging(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const startDrag = (type: "config" | "output", e: React.MouseEvent) => {
    dragging.current = type;
    setIsDragging(type);
    startPos.current = type === "output" ? e.clientY : e.clientX;
    startSize.current = type === "config" ? configWidth : outputHeight;
    document.body.style.cursor = type === "output" ? "ns-resize" : "ew-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const handleRun = async () => {
    startExecution();
    try {
      const payload = {
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type as string,
          config:
            ((n.data as { config?: Record<string, unknown> } | undefined)
              ?.config as Record<string, unknown>) ?? {},
        })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      };
      const res = await runPipeline(payload);
      setExecutionResult(res);
      setSaveButtonState("idle");
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Something went wrong";
      setExecutionError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    }
  };

  useEffect(() => {
    const fetchNodeMetadata = async () => {
      try {
        setNodeMetadata(await getNodes());
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchNodeMetadata();
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  useEffect(() => {
    if (selectedNodeId && !configOpen) {
      setConfigOpen(true);
    }
  }, [selectedNodeId]);

  const handleDelete = () => {
    if (selectedNodeId) deleteNode(selectedNodeId);
    else if (selectedEdgeId) deleteEdge(selectedEdgeId);
  };

  const buildSavedRun = (result: any) => {
    const output = result.output;
    if (!output) return null;
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      modelName: output.model_name ?? output.run_summary?.model ?? "unknown",
      taskType: output.run_summary?.task_type ?? "unknown",
      metrics: output.metrics ?? {},
      configUsed: output.config_used ?? {},
      executionTime: result.execution_time ?? 0,
    };
  };

  const handleSaveRun = () => {
    if (latestResult) {
      const run = buildSavedRun(latestResult);
      if (run) {
        saveRun(run);
        setSaveButtonState("saved");
        setToast({ message: "Run saved successfully!", type: "success" });
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
      }
    }
  };

  useEffect(() => {
    setSaveButtonState("idle");
  }, [latestResult]);

  const ResizeHandle = ({
    direction,
    onMouseDown,
  }: {
    direction: "ew" | "ns";
    onMouseDown: (e: React.MouseEvent) => void;
  }) => (
    <div
      onMouseDown={onMouseDown}
      className={`shrink-0 bg-transparent hover:bg-violet-500/40 active:bg-violet-500/60 transition-colors z-10 ${direction === "ew" ? "w-[3px] cursor-ew-resize" : "h-[3px] w-full cursor-ns-resize"}`}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11] overflow-hidden">
      {/* Topbar */}
      <div className="h-12 bg-[#0f0f11] border-b border-white/[0.07] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="text-white/40 text-[13px]">ML Workflow Builder</span>
          <span className="text-white/20 text-[13px]">/</span>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape")
                  setEditingName(false);
              }}
              className="bg-white/5 border border-violet-500/50 rounded px-2 py-0.5 text-[13px] text-white outline-none w-44"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 text-[13px] text-white hover:text-white/80 transition-colors group"
            >
              {canvasName}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-0 group-hover:opacity-50 transition-opacity"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Undo"
            className="h-7 w-7 rounded border border-white/10 bg-transparent flex items-center justify-center disabled:opacity-30 hover:bg-white/5 cursor-pointer text-white/50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10a7 7 0 010 14h-1" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Redo"
            className="h-7 w-7 rounded border border-white/10 bg-transparent flex items-center justify-center disabled:opacity-30 hover:bg-white/5 cursor-pointer text-white/50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 14l5-5-5-5" />
              <path d="M20 9H10a7 7 0 000 14h1" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedNodeId && !selectedEdgeId}
            title="Delete selected"
            className="h-7 w-7 rounded border border-white/10 bg-transparent flex items-center justify-center disabled:opacity-30 hover:bg-red-500/10 hover:border-red-500/30 cursor-pointer text-white/50 hover:text-red-400 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={handleSaveRun}
            disabled={!latestResult || loading}
            className="h-7 px-3 rounded border border-white/10 bg-transparent text-white/50 cursor-pointer text-[11px] flex items-center gap-1.5 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saveButtonState === "saved" ? "Saved" : "Save Run"}
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className={`h-7 px-3.5 rounded border-0 text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${loading ? "bg-[#5b21b6] cursor-not-allowed opacity-80" : "bg-[#7c3aed] cursor-pointer hover:bg-[#6d28d9]"}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {loading ? "Running..." : "Run Pipeline"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon rail */}
        <div className="w-14 bg-[#0a0a0c] border-r border-white/[0.05] flex flex-col items-center pt-3 gap-1 shrink-0">
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
              label: "Flows",
              svg: (
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              ),
            },
            { label: "Runs", svg: <polygon points="5 3 19 12 5 21 5 3" /> },
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
              onClick={i === 0 ? () => setSidebarOpen((v) => !v) : undefined}
              className={`w-11 py-2 rounded-lg border-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                i === 0 && sidebarOpen
                  ? "bg-violet-500/10 text-violet-400"
                  : "bg-transparent text-white/30 hover:text-white/55"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.svg}
              </svg>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar — fixed width, no resize */}
        <div
          style={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
          className="shrink-0 flex flex-col overflow-hidden bg-[#111114] border-r border-white/[0.05] transition-all duration-300 ease-out"
        >
          {/* Sidebar header with collapse button on RIGHT (collapses to left) */}
          <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.05] shrink-0">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Available Nodes
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            >
              {/* Arrow points LEFT = collapse to left */}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <div
            className="flex-1 overflow-hidden opacity-0 transition-opacity duration-300"
            style={{
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? "auto" : "none",
            }}
          >
            <Sidebar />
          </div>
        </div>

        {/* Main canvas + output */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 relative overflow-hidden">
            <Canvas />
          </div>

          {/* Output panel */}
          {outputOpen && (
            <ResizeHandle
              direction="ns"
              onMouseDown={(e) => startDrag("output", e)}
            />
          )}
          <div
            className={`shrink-0 bg-[#111114] border-t border-white/[0.05] flex flex-col overflow-hidden ${
              isDragging === "output"
                ? ""
                : "transition-all duration-300 ease-out"
            }`}
            style={{ height: outputOpen ? outputHeight : 36 }}
          >
            <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.05] shrink-0">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                Output
              </span>
              <button
                onClick={() => setOutputOpen((v) => !v)}
                className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    transform: outputOpen ? "rotate(0deg)" : "rotate(180deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  {/* Points down when open (to collapse), up when closed (to expand) */}
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            {outputOpen && (
              <div
                className="flex-1 overflow-hidden opacity-0 transition-opacity duration-300"
                style={{
                  opacity: outputOpen ? 1 : 0,
                  pointerEvents: outputOpen ? "auto" : "none",
                }}
              >
                <OutputPanel />
              </div>
            )}
          </div>
        </div>

        {/* Config resize handle */}
        {configOpen && (
          <ResizeHandle
            direction="ew"
            onMouseDown={(e) => startDrag("config", e)}
          />
        )}

        {/* Config panel */}
        <div
          className={`shrink-0 bg-[#111114] border-l border-white/[0.05] flex flex-col overflow-hidden ${
            isDragging === "config"
              ? ""
              : "transition-all duration-300 ease-out"
          }`}
          style={{ width: configOpen ? configWidth : 36 }}
        >
          {/* Config header — always visible, clean minimal design */}
          <div className="h-9 flex items-center px-2 border-b border-white/[0.05] shrink-0">
            <button
              onClick={() => setConfigOpen((v) => !v)}
              className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0 hover:bg-white/5 rounded"
              title={configOpen ? "Collapse" : "Expand config"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  transform: configOpen ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.2s",
                }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            {configOpen && (
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-2 flex-1 min-w-0 truncate">
                Node Configuration
              </span>
            )}
          </div>
          {configOpen && (
            <div
              className="flex-1 overflow-y-auto opacity-0 transition-opacity duration-300"
              style={{
                opacity: configOpen ? 1 : 0,
                pointerEvents: configOpen ? "auto" : "none",
              }}
            >
              <ConfigPanel nodeMetadata={nodeMetadata} />
            </div>
          )}
          {!configOpen && (
            <div
              className="flex-1 flex items-start justify-center overflow-hidden pt-4 opacity-0 transition-opacity duration-300"
              style={{
                opacity: !configOpen ? 1 : 0,
                pointerEvents: !configOpen ? "auto" : "none",
              }}
            >
              <span
                className="text-[9px] text-white/20 uppercase tracking-widest font-medium whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                Node Configuration
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 ${
            toast.type === "error" ? "right-4" : "left-4"
          } px-4 py-3 rounded-lg border text-sm flex items-center gap-2 transition-all duration-300 ${
            toastVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${
            toast.type === "success"
              ? "bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.35)] text-[#34d399]"
              : "bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.35)] text-[#f87171]"
          }`}
        >
          {toast.type === "success" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
