"use client";
import { useMemo, useState, useEffect } from "react";
import {
  useOutputStore,
  type PipelineExecutionResult,
  type SavedRun,
} from "@/store/outputStore";

const tabs = [
  { id: "results", label: "Results" },
  { id: "code", label: "Code Export" },
  { id: "compare", label: "Compare Runs" },
] as const;

type TabId = (typeof tabs)[number]["id"];
type TableData = { columns: string[]; rows: string[][] };

const formatMetricValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number")
    return Number.isFinite(value) ? value.toFixed(4) : String(value);
  return String(value);
};

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number")
    return Number.isFinite(value) ? value.toFixed(4) : String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const buildPreviewTable = (preview: unknown[]): TableData => {
  if (preview.length === 0) return { columns: [], rows: [] };
  const first = preview[0];
  if (first && typeof first === "object" && !Array.isArray(first)) {
    const keys = Array.from(
      new Set(
        preview.flatMap((item) => Object.keys(item as Record<string, unknown>)),
      ),
    ).slice(0, 6);
    return {
      columns: keys,
      rows: preview
        .slice(0, 8)
        .map((row) =>
          keys.map((key) =>
            formatCellValue((row as Record<string, unknown>)[key]),
          ),
        ),
    };
  }
  if (Array.isArray(first)) {
    return {
      columns: first.map((_, i) => `col_${i + 1}`).slice(0, 6),
      rows: preview
        .slice(0, 8)
        .map((row) => (row as unknown[]).slice(0, 6).map(formatCellValue)),
    };
  }
  return {
    columns: ["index", "value"],
    rows: preview
      .slice(0, 8)
      .map((v, i) => [String(i + 1), formatCellValue(v)]),
  };
};

const tokenizedPython = (code: string) => {
  const keywords = new Set([
    "def",
    "class",
    "import",
    "from",
    "as",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "try",
    "except",
    "with",
    "True",
    "False",
    "None",
    "in",
    "and",
    "or",
    "not",
    "print",
  ]);
  return code.split("\n").map((line, lineIndex) => {
    const parts: Array<{ type: string; value: string }> = [];
    let buffer = "",
      inString: "single" | "double" | null = null,
      i = 0;
    while (i < line.length) {
      const char = line[i];
      if (!inString && char === "#") {
        if (buffer) {
          parts.push({ type: "plain", value: buffer });
          buffer = "";
        }
        parts.push({ type: "comment", value: line.slice(i) });
        break;
      }
      if (!inString && (char === "'" || char === '"')) {
        if (buffer) {
          parts.push({ type: "plain", value: buffer });
          buffer = "";
        }
        inString = char === "'" ? "single" : "double";
        buffer += char;
        i++;
        continue;
      }
      if (inString) {
        buffer += char;
        if (
          (inString === "single" && char === "'") ||
          (inString === "double" && char === '"')
        ) {
          parts.push({ type: "string", value: buffer });
          buffer = "";
          inString = null;
        }
        i++;
        continue;
      }
      if (/[A-Za-z_]/.test(char)) {
        if (buffer && !/[A-Za-z0-9_]/.test(buffer[buffer.length - 1])) {
          parts.push({ type: "plain", value: buffer });
          buffer = "";
        }
        let word = char;
        i++;
        while (i < line.length && /[A-Za-z0-9_]/.test(line[i])) {
          word += line[i];
          i++;
        }
        parts.push({
          type: keywords.has(word) ? "keyword" : "plain",
          value: word,
        });
        continue;
      }
      buffer += char;
      i++;
    }
    if (buffer) parts.push({ type: "plain", value: buffer });
    return (
      <div key={`line-${lineIndex}`} className="whitespace-pre">
        {parts.map((part, pi) =>
          part.type === "keyword" ? (
            <span key={pi} className="text-[#a78bfa]">
              {part.value}
            </span>
          ) : part.type === "string" ? (
            <span key={pi} className="text-[#86efac]">
              {part.value}
            </span>
          ) : part.type === "comment" ? (
            <span key={pi} className="text-white/40">
              {part.value}
            </span>
          ) : (
            <span key={pi}>{part.value}</span>
          ),
        )}
      </div>
    );
  });
};

const buildSavedRun = (result: PipelineExecutionResult): SavedRun | null => {
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

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div>
    <p className="text-[12px] uppercase tracking-[0.18em] text-white/40 font-semibold">
      {title}
    </p>
    {subtitle && <p className="text-[11px] text-white/35 mt-1">{subtitle}</p>}
  </div>
);

const MetricCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string | null;
}) => (
  <div className="bg-[#15151b] border border-white/5 rounded-xl px-4 py-3 flex flex-col gap-1">
    <span className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
      {label}
    </span>
    <span className="text-[18px] font-semibold text-white">
      {formatMetricValue(value)}
    </span>
  </div>
);

const ResultsTab = () => {
  const { latestResult, loading, error, saveRun, savedRuns } = useOutputStore();
  const [saveButtonState, setSaveButtonState] = useState<"idle" | "saved">(
    "idle",
  );
  const output = latestResult?.output;
  const metrics = output?.metrics ?? {};
  const preview = Array.isArray(output?.predictions_preview)
    ? output.predictions_preview
    : [];
  const tableData = buildPreviewTable(preview);
  const hasResult = Boolean(latestResult && !error);
  const canSaveRun = Boolean(latestResult && !error && !loading);

  const handleSaveRun = () => {
    if (latestResult && canSaveRun) {
      const run = buildSavedRun(latestResult);
      if (run) {
        saveRun(run);
        setSaveButtonState("saved");
      }
    }
  };

  useEffect(() => {
    setSaveButtonState("idle");
  }, [latestResult]);

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-28 rounded-xl bg-white/5" />
        <div className="h-28 rounded-xl bg-white/5" />
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-[12px] text-[#f87171]">
        {error}
      </div>
    );

  if (!hasResult)
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-5 py-6 text-white/50 text-[13px]">
        Run a pipeline to view metrics, predictions, and model diagnostics.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12px] text-white/50">
            Time: {latestResult?.execution_time?.toFixed(3) ?? "0.000"}s
          </span>
          <span className="text-[12px] text-white/50">
            Model: {output?.model_name ?? output?.run_summary?.model ?? "-"}
          </span>
          <span className="text-[12px] text-white/50">
            Task: {output?.run_summary?.task_type ?? "-"}
          </span>
        </div>
        <button
          onClick={handleSaveRun}
          disabled={!canSaveRun}
          className={`h-8 px-3 rounded-lg border text-[12px] flex items-center gap-1.5 ${
            canSaveRun
              ? "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              : "border-white/5 bg-white/5 text-white/30 cursor-not-allowed"
          }`}
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
      </div>
      <div>
        <SectionHeader
          title="Metrics"
          subtitle={
            Object.keys(metrics).length
              ? "Model performance summary"
              : "No metrics returned"
          }
        />
        {Object.keys(metrics).length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {Object.entries(metrics).map(([k, v]) => (
              <MetricCard key={k} label={k} value={v} />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
            Metrics are not available for this run.
          </div>
        )}
      </div>
      <div>
        <SectionHeader
          title="Predictions Preview"
          subtitle={
            preview.length
              ? "Sample outputs from the model"
              : "No predictions preview"
          }
        />
        {preview.length ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
            <div className="max-h-44 overflow-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#141419] text-white/50 sticky top-0">
                  <tr>
                    {tableData.columns.map((col) => (
                      <th key={col} className="px-3 py-2 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tableData.rows.map((row, ri) => (
                    <tr key={ri} className="text-white/80">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
            Predictions preview will appear after execution.
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
            Pipeline Summary
          </p>
          <div className="mt-3 flex items-center gap-6 text-[12px] text-white/70">
            <div>
              <p className="text-white/40">Nodes</p>
              <p className="text-[16px] font-semibold text-white mt-1">
                {latestResult?.pipeline_summary?.total_nodes ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-white/40">Edges</p>
              <p className="text-[16px] font-semibold text-white mt-1">
                {latestResult?.pipeline_summary?.total_edges ?? "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
            Saved Runs
          </p>
          <p className="mt-2 text-[12px] text-white/60">
            {savedRuns.length} run{savedRuns.length === 1 ? "" : "s"} saved
          </p>
          <p className="mt-1 text-[11px] text-white/40">
            Use Compare Runs to inspect differences.
          </p>
        </div>
      </div>
    </div>
  );
};

const CodeExportTab = () => {
  const { latestResult } = useOutputStore();
  const [toast, setToast] = useState<string | null>(null);
  const code = latestResult?.generated_code ?? "";

  if (!code)
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-5 py-6 text-white/50 text-[13px]">
        Run a pipeline to generate exportable Python code.
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-white/50">
          Generated sklearn pipeline code
        </p>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setToast("Copied!");
            setTimeout(() => setToast(null), 2000);
          }}
          className="h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[12px] text-white/80 hover:text-white"
        >
          Copy
        </button>
      </div>
      <div className="rounded-xl border border-white/5 bg-[#0e0e12]">
        <div className="max-h-64 overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-white/90">
          {tokenizedPython(code)}
        </div>
      </div>
      {toast && (
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.15)] px-3 py-1 text-[11px] text-[#34d399]">
          {toast}
        </div>
      )}
    </div>
  );
};

const CompareRunsTab = () => {
  const { savedRuns, selectedCompareIds, toggleCompareRun } = useOutputStore();
  const selectedRuns = savedRuns.filter((r) =>
    selectedCompareIds.includes(r.id),
  );
  const bestMetrics = useMemo(() => {
    const best: Record<string, number> = {};
    selectedRuns.forEach((run) =>
      Object.entries(run.metrics).forEach(([m, v]) => {
        if (
          typeof v === "number" &&
          Number.isFinite(v) &&
          (best[m] === undefined || v > best[m])
        )
          best[m] = v;
      }),
    );
    return best;
  }, [selectedRuns]);

  if (!savedRuns.length)
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-5 py-6 text-white/50 text-[13px]">
        Save at least one run to compare experiments.
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[12px] text-white/50">Select up to two runs</p>
        <div className="flex flex-wrap gap-2">
          {savedRuns.map((run) => (
            <button
              key={run.id}
              onClick={() => toggleCompareRun(run.id)}
              className={`px-3 py-1 rounded-full border text-[11px] ${selectedCompareIds.includes(run.id) ? "border-[#7c3aed] bg-[rgba(124,58,237,0.2)] text-[#c4b5fd]" : "border-white/10 bg-white/5 text-white/60"}`}
            >
              {run.modelName} · {new Date(run.timestamp).toLocaleTimeString()}
            </button>
          ))}
        </div>
      </div>
      {selectedRuns.length ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {selectedRuns.map((run) => (
            <div
              key={run.id}
              className="rounded-xl border border-white/5 bg-[#141419] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-white/40">
                    {new Date(run.timestamp).toLocaleString()}
                  </p>
                  <p className="text-[16px] font-semibold text-white mt-1">
                    {run.modelName}
                  </p>
                  <p className="text-[12px] text-white/50">{run.taskType}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-white/40">Execution Time</p>
                  <p className="text-[14px] font-semibold text-white mt-1">
                    {run.executionTime.toFixed(3)}s
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
                  Metrics
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(run.metrics).map(([metric, value]) => {
                    const highlight =
                      typeof value === "number" &&
                      Number.isFinite(value) &&
                      bestMetrics[metric] === value;
                    return (
                      <div
                        key={metric}
                        className={`rounded-lg border px-3 py-2 text-[12px] ${highlight ? "border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.12)] text-[#34d399]" : "border-white/5 bg-white/5 text-white/70"}`}
                      >
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.12em]">
                          {metric}
                        </p>
                        <p className="text-[13px] font-semibold mt-1">
                          {formatMetricValue(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
                  Config Used
                </p>
                <div className="mt-2 grid grid-cols-1 gap-1 text-[12px] text-white/70">
                  {Object.entries(run.configUsed).length ? (
                    Object.entries(run.configUsed).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white/40">{k}</span>
                        <span>{formatCellValue(v)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40">No config data captured.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-[#141419] px-5 py-6 text-white/50 text-[13px]">
          Select two runs to compare them side by side.
        </div>
      )}
    </div>
  );
};

export default function OutputPanel() {
  const { activeTab, setActiveTab, latestResult, loading } = useOutputStore();
  const statusLabel = latestResult?.status ?? (loading ? "running" : "idle");

  return (
    <div className="w-full h-full px-5 py-4 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-[11px] rounded-full px-2.5 py-0.5 border ${
              loading
                ? "border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.15)] text-[#93c5fd]"
                : latestResult
                  ? "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.15)] text-[#34d399]"
                  : "border-white/10 bg-white/5 text-white/40"
            }`}
          >
            {statusLabel}
          </span>
          {loading && (
            <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-[#7c3aed] animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-3 py-1.5 rounded-full text-[12px] border transition ${activeTab === tab.id ? "border-[#7c3aed] bg-[rgba(124,58,237,0.2)] text-[#c4b5fd]" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "results" && <ResultsTab />}
      {activeTab === "code" && <CodeExportTab />}
      {activeTab === "compare" && <CompareRunsTab />}
    </div>
  );
}
