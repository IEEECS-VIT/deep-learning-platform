"use client";
import { useMemo } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useOutputStore } from "@/store/outputStore";
import { useToastStore } from "@/store/toastStore";
import { useSettingsStore, type CanvasSettings } from "@/store/settingsStore";

export default function SettingsPanel() {
  const addToast = useToastStore((s) => s.addToast);
  const settings = useSettingsStore((state) => state.settings);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const update = <K extends keyof CanvasSettings>(
    key: K,
    value: CanvasSettings[K],
  ) => {
    updateSetting(key, value);
  };

  const handleClearCanvas = () => {
    usePipelineStore.setState({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      selectedNodeId: null,
      selectedEdgeId: null,
    });
    addToast("Canvas cleared");
  };

  const handleClearRuns = () => {
    useOutputStore.setState({
      savedRuns: [],
      selectedCompareIds: [],
      latestResult: null,
    });
    addToast("All runs cleared");
  };

  const handleClearPipelines = () => {
    localStorage.removeItem("ml_saved_pipelines");
    addToast("Saved pipelines cleared");
  };

  const handleResetSettings = () => {
    resetSettings();
    addToast("Settings reset to defaults");
  };

  const currentZoom = useMemo(
    () => settings.defaultZoom.toFixed(1),
    [settings.defaultZoom],
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest px-3 pt-4 pb-1.5">
      {children}
    </p>
  );

  const Row = ({
    label,
    desc,
    children,
  }: {
    label: string;
    desc?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04]">
      <div className="mr-4 min-w-0">
        <p className="text-[11px] text-white/60">{label}</p>
        {desc && <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 ${value ? "bg-violet-500" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${value ? "left-[14px]" : "left-[2px]"}`}
      />
    </button>
  );

  const shortcuts = [
    { action: "Undo", keys: ["Ctrl", "Z"] },
    { action: "Redo", keys: ["Ctrl", "Y"] },
    { action: "Delete selected", keys: ["Del"] },
    { action: "Add node to canvas", keys: ["Dbl click sidebar"] },
    { action: "Delete node/edge", keys: ["Dbl click"] },
    { action: "Delete by dragging", keys: ["Drag to trash"] },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SectionLabel>Canvas</SectionLabel>
      <Row label="Background Style">
        <select
          value={settings.canvasBackground}
          onChange={(e) =>
            update(
              "canvasBackground",
              e.target.value as CanvasSettings["canvasBackground"],
            )
          }
          className="bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 outline-none cursor-pointer"
          style={{ background: "#1a1a1f", color: "#e8e8e8" }}
        >
          <option
            value="dots"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            Dots
          </option>
          <option
            value="lines"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            Lines
          </option>
          <option
            value="none"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            None
          </option>
        </select>
      </Row>
      <Row label="Connection style">
        <select
          value={settings.connectionLineStyle}
          onChange={(e) =>
            update(
              "connectionLineStyle",
              e.target.value as CanvasSettings["connectionLineStyle"],
            )
          }
          className="bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-[10px] text-white/60 outline-none cursor-pointer"
          style={{ background: "#1a1a1f", color: "#e8e8e8" }}
        >
          <option
            value="bezier"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            Bezier
          </option>
          <option
            value="straight"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            Straight
          </option>
          <option
            value="step"
            style={{ background: "#1a1a1f", color: "#e8e8e8" }}
          >
            Step
          </option>
        </select>
      </Row>
      <Row label="Minimap" desc="Show minimap overlay">
        <Toggle
          value={settings.minimap}
          onChange={(v) => update("minimap", v)}
        />
      </Row>
      <Row label="Show controls" desc="Display zoom and fit controls">
        <Toggle
          value={settings.showControls}
          onChange={(v) => update("showControls", v)}
        />
      </Row>
      <Row label="Animate edges" desc="Animated dashed edges">
        <Toggle
          value={settings.animateEdges}
          onChange={(v) => update("animateEdges", v)}
        />
      </Row>
      <Row label="Show node labels" desc="Display labels under nodes">
        <Toggle
          value={settings.showNodeLabels}
          onChange={(v) => update("showNodeLabels", v)}
        />
      </Row>
      <Row
        label="Show node summaries"
        desc="Display the short helper text on nodes"
      >
        <Toggle
          value={settings.showNodeSummaries}
          onChange={(v) => update("showNodeSummaries", v)}
        />
      </Row>
      
      
      <SectionLabel>Data</SectionLabel>
      <Row label="Clear canvas" desc="Remove all nodes and edges">
        <button
          onClick={handleClearCanvas}
          className="text-[10px] px-2.5 py-1 rounded border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          Clear
        </button>
      </Row>
      <Row label="Clear all runs" desc="Delete all saved run history">
        <button
          onClick={handleClearRuns}
          className="text-[10px] px-2.5 py-1 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Clear
        </button>
      </Row>
      <Row label="Clear saved pipelines" desc="Delete locally saved pipelines">
        <button
          onClick={handleClearPipelines}
          className="text-[10px] px-2.5 py-1 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Clear
        </button>
      </Row>
      <Row label="Reset all settings" desc="Restore defaults">
        <button
          onClick={handleResetSettings}
          className="text-[10px] px-2.5 py-1 rounded border border-red-500/20 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Reset
        </button>
      </Row>

      <SectionLabel>About</SectionLabel>
      <div className="px-3 py-3 mb-4 flex flex-col gap-1">
        <p className="text-[10px] text-white/25">ML Workflow Builder · v0.6</p>
        <p className="text-[10px] text-white/20">Visual ML pipeline editor</p>
      </div>
    </div>
  );
}
