"use client";
import { useOutputStore } from "@/store/outputStore";

const fmtNum = (v: number | string | null | undefined) => {
  if (v == null) return "-";
  if (typeof v === "number") return Number.isFinite(v) ? v.toFixed(3) : String(v);
  return String(v);
};

export default function RunsPanel() {
  const { savedRuns, selectedCompareIds, toggleCompareRun } = useOutputStore();

  if (!savedRuns.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <p className="text-[11px] text-white/25">No runs yet. Run a pipeline to see results here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.05] shrink-0">
        <p className="text-[10px] text-white/30">{savedRuns.length} run{savedRuns.length !== 1 ? "s" : ""} saved</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {savedRuns.map((run) => {
          const selected = selectedCompareIds.includes(run.id);
          const metrics = Object.entries(run.metrics).slice(0, 2);
          return (
            <button
              key={run.id}
              onClick={() => toggleCompareRun(run.id)}
              className={`w-full text-left px-3 py-3 border-b border-white/[0.04] transition-colors ${selected ? "bg-violet-500/8" : "hover:bg-white/[0.02]"}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-white/70 truncate">{run.modelName}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${selected ? "border-violet-500/40 text-violet-400 bg-violet-500/10" : "border-white/10 text-white/30"}`}>
                  {selected ? "selected" : "select"}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] text-white/30">{run.taskType}</span>
                <span className="text-[10px] text-white/20">·</span>
                <span className="text-[10px] text-white/30">{run.executionTime.toFixed(2)}s</span>
                {run.dataset && (
                  <>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30 truncate">{run.dataset}</span>
                  </>
                )}
              </div>
              {metrics.length > 0 && (
                <div className="flex items-center gap-3">
                  {metrics.map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <span className="text-[9px] text-white/25 uppercase tracking-wider">{k}</span>
                      <span className="text-[10px] font-medium text-white/50">{fmtNum(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-white/20 mt-1.5">{new Date(run.timestamp).toLocaleString()}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}