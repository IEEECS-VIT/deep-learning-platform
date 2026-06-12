"use client";
import { useEffect, useState } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useToastStore } from "@/store/toastStore";

type SavedPipeline = {
  id: string;
  name: string;
  savedAt: string;
  nodeCount: number;
  edgeCount: number;
  nodes: unknown[];
  edges: unknown[];
};

const STORAGE_KEY = "ml_saved_pipelines";

const loadPipelines = (): SavedPipeline[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const savePipelines = (pipelines: SavedPipeline[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines));
};

export default function HistoryPanel() {
  const { nodes, edges } = usePipelineStore();
  const addToast = useToastStore((s) => s.addToast);
  const [pipelines, setPipelines] = useState<SavedPipeline[]>([]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setPipelines(loadPipelines());
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    const pipeline: SavedPipeline = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      savedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes,
      edges,
    };
    const updated = [pipeline, ...pipelines];
    savePipelines(updated);
    setPipelines(updated);
    setName("");
    setSaving(false);
    addToast("Pipeline saved!");
  };

  const handleLoad = (pipeline: SavedPipeline) => {
    usePipelineStore.setState({
      nodes: pipeline.nodes as never,
      edges: pipeline.edges as never,
      past: [],
      future: [],
    });
    addToast(`Loaded "${pipeline.name}"`);
  };

  const handleDelete = (id: string) => {
    const updated = pipelines.filter((p) => p.id !== id);
    savePipelines(updated);
    setPipelines(updated);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Save button */}
      <div className="px-3 py-2.5 border-b border-white/[0.05] shrink-0">
        {saving ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setSaving(false); }}
              placeholder="Pipeline name..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-violet-500/50 placeholder:text-white/20"
            />
            <button onClick={handleSave} className="text-[10px] px-2 py-1 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 transition-colors">Save</button>
            <button onClick={() => setSaving(false)} className="text-[10px] px-2 py-1 rounded border border-white/10 text-white/30 hover:bg-white/5 transition-colors">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => { if (nodes.length === 0) { addToast("Canvas is empty", "error"); return; } setSaving(true); }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-white/10 text-[10px] text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save current pipeline
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {pipelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="text-[11px] text-white/25">No saved pipelines. Save your current canvas to get started.</p>
          </div>
        ) : (
          pipelines.map((p) => (
            <div key={p.id} className="px-3 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-white/70 truncate">{p.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleLoad(p)} className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">Load</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/25">{p.nodeCount} nodes</span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[10px] text-white/25">{p.edgeCount} edges</span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[10px] text-white/20">{new Date(p.savedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}