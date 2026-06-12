"use client";
import { useState, useEffect } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useOutputStore } from "@/store/outputStore";
import { useToastStore } from "@/store/toastStore";

const SETTINGS_KEY = "ml_settings";

type Settings = {
  apiUrl: string;
  canvasBackground: "dots" | "lines" | "none";
  animateEdges: boolean;
  snapToGrid: boolean;
  snapGrid: number;
};

const defaultSettings: Settings = {
  apiUrl: "http://localhost:8000",
  canvasBackground: "dots",
  animateEdges: false,
  snapToGrid: false,
  snapGrid: 15,
};

const loadSettings = (): Settings => {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") };
  } catch {
    return defaultSettings;
  }
};

export default function SettingsPanel() {
  const addToast = useToastStore((s) => s.addToast);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const handleClearCanvas = () => {
    usePipelineStore.setState({ nodes: [], edges: [], past: [], future: [], selectedNodeId: null, selectedEdgeId: null });
    addToast("Canvas cleared");
  };

  const handleClearRuns = () => {
    useOutputStore.setState({ savedRuns: [], selectedCompareIds: [], latestResult: null });
    addToast("All runs cleared");
  };

  const handleClearPipelines = () => {
    localStorage.removeItem("ml_saved_pipelines");
    addToast("Saved pipelines cleared");
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest px-3 pt-4 pb-1.5">{children}</p>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04]">
      <div>
        <p className="text-[11px] text-white/60">{label}</p>
        {desc && <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`w-8 h-4.5 rounded-full relative transition-colors ${value ? "bg-violet-500" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${value ? "left-[14px]" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      <SectionLabel>API</SectionLabel>
      <div className="px-3 pb-2">
        <input
          value={settings.apiUrl}
          onChange={(e) => update("apiUrl", e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-violet-500/50 font-mono"
          placeholder="http://localhost:8000"
        />
      </div>

      <SectionLabel>Canvas</SectionLabel>
      <Row label="Background" desc="Canvas grid style">
        <select
          value={settings.canvasBackground}
          onChange={(e) => update("canvasBackground", e.target.value as Settings["canvasBackground"])}
          className="bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 outline-none cursor-pointer"
        >
          <option value="dots">Dots</option>
          <option value="lines">Lines</option>
          <option value="none">None</option>
        </select>
      </Row>
      <Row label="Snap to grid" desc="Snap nodes while dragging">
        <Toggle value={settings.snapToGrid} onChange={(v) => update("snapToGrid", v)} />
      </Row>
      {settings.snapToGrid && (
        <Row label="Snap grid size">
          <input
            type="number"
            min={5} max={50}
            value={settings.snapGrid}
            onChange={(e) => update("snapGrid", Number(e.target.value))}
            className="w-14 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 outline-none text-center"
          />
        </Row>
      )}
      <Row label="Animate edges" desc="Animated dashed edges">
        <Toggle value={settings.animateEdges} onChange={(v) => update("animateEdges", v)} />
      </Row>

      <SectionLabel>Data</SectionLabel>
      <Row label="Clear canvas" desc="Remove all nodes and edges">
        <button onClick={handleClearCanvas} className="text-[10px] px-2.5 py-1 rounded border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors">Clear</button>
      </Row>
      <Row label="Clear all runs" desc="Delete all saved run history">
        <button onClick={handleClearRuns} className="text-[10px] px-2.5 py-1 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">Clear</button>
      </Row>
      <Row label="Clear saved pipelines" desc="Delete all locally saved pipelines">
        <button onClick={handleClearPipelines} className="text-[10px] px-2.5 py-1 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">Clear</button>
      </Row>

      <SectionLabel>Keyboard Shortcuts</SectionLabel>
      {[
        ["Delete / Backspace", "Delete selected node or edge"],
        ["Ctrl + Z", "Undo"],
        ["Ctrl + Y", "Redo"],
        ["Double click node", "Delete node"],
        ["Double click edge", "Delete edge"],
        ["Double click sidebar", "Add node to canvas"],
        ["Drag to trash", "Delete node"],
      ].map(([key, desc]) => (
        <div key={key} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
          <span className="text-[10px] text-white/30">{desc}</span>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/40 font-mono">{key}</kbd>
        </div>
      ))}

      <SectionLabel>About</SectionLabel>
      <div className="px-3 py-2 mb-4">
        <p className="text-[10px] text-white/25">ML Workflow Builder · v0.5</p>
        <p className="text-[10px] text-white/20 mt-0.5">Visual ML pipeline editor</p>
      </div>
    </div>
  );
}