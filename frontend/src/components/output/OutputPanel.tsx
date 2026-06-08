"use client";
import { useMemo } from "react";
import {
  useOutputStore,
  type PipelineExecutionResult,
  type SavedRun,
} from "@/store/outputStore";
import { useToastStore } from "@/store/toastStore";
import LossCurveChart from "./LossCurveChart";
import TrainingSummaryCard from "./TrainingSummaryCard";
import GeneratedCodePanel from "./GeneratedCodePanel";
import ValidationErrorBanner from "./ValidationErrorBanner";

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

const StatusBar = ({
  status,
  executionTime,
  loading,
}: {
  status?: string;
  executionTime?: number;
  loading: boolean;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
    <div className="flex items-center gap-3">
      <span
        className={`text-[11px] rounded-full px-2.5 py-0.5 border capitalize ${
          loading
            ? "border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.15)] text-[#93c5fd]"
            : status === "success" || status === "completed"
              ? "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.15)] text-[#34d399]"
              : status === "error"
                ? "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.15)] text-[#f87171]"
                : "border-white/10 bg-white/5 text-white/40"
        }`}
      >
        {loading ? "running" : (status ?? "idle")}
      </span>
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-[#7c3aed] animate-spin" />
      )}
    </div>
    <div className="flex flex-wrap items-center gap-4 text-[12px] text-white/50">
      <span>
        Execution Time:{" "}
        <span className="text-white/80 font-medium">
          {executionTime != null ? `${executionTime.toFixed(3)}s` : "-"}
        </span>
      </span>
    </div>
  </div>
);

const ResultsTab = () => {
  const { latestResult, loading, error, saveRun } = useOutputStore();
  const addToast = useToastStore((state) => state.addToast);
  const output = latestResult?.output;
  const metrics = output?.metrics ?? {};
  const lossHistory = Array.isArray(output?.loss_history)
    ? output.loss_history
    : [];
  const trainingSummary = output?.training_summary;
  const generatedCode = latestResult?.generated_code ?? "";
  const preview = Array.isArray(output?.predictions_preview)
    ? output.predictions_preview
    : [];
  const tableData = buildPreviewTable(preview);
  const hasResult = Boolean(latestResult && !error);
  const canSaveRun = Boolean(latestResult && !error && !loading);

  const primaryMetrics = useMemo(() => {
    const entries: Array<{ key: string; label: string; value: unknown }> = [];
    if (metrics.accuracy !== undefined)
      entries.push({ key: "accuracy", label: "Accuracy", value: metrics.accuracy });
    if (metrics.loss !== undefined)
      entries.push({ key: "loss", label: "Loss", value: metrics.loss });
    const otherKeys = Object.keys(metrics).filter(
      (k) => k !== "accuracy" && k !== "loss",
    );
    otherKeys.forEach((k) =>
      entries.push({ key: k, label: k.replace(/_/g, " "), value: metrics[k] }),
    );
    return entries;
  }, [metrics]);

  const handleSaveRun = () => {
    if (latestResult && canSaveRun) {
      const run = buildSavedRun(latestResult);
      if (run) {
        saveRun(run);
        addToast("Run saved successfully!");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <StatusBar loading executionTime={undefined} />
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5" />
            ))}
          </div>
          <div className="h-28 rounded-xl bg-white/5" />
          <div className="h-40 rounded-xl bg-white/5" />
          <div className="h-28 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <StatusBar status="error" loading={false} />
        <ValidationErrorBanner />
      </div>
    );
  }

  if (!hasResult) {
    return (
      <div className="space-y-4">
        <StatusBar status="idle" loading={false} />
        <div className="rounded-xl border border-white/5 bg-[#141419] px-5 py-6 text-white/50 text-[13px]">
          Run a pipeline to view metrics, predictions, training summary, and
          generated code.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBar
          status={latestResult?.status ?? "success"}
          executionTime={latestResult?.execution_time}
          loading={false}
        />
        <button
          onClick={handleSaveRun}
          disabled={!canSaveRun}
          className={`h-8 px-3 rounded-lg border text-[12px] flex items-center gap-1.5 ${
            canSaveRun
              ? "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              : "border-white/5 bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          Save Run
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <SectionHeader
            title="Metrics"
            subtitle={
              primaryMetrics.length
                ? "Model performance summary"
                : "No metrics returned"
            }
          />
          {primaryMetrics.length ? (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {primaryMetrics.map(({ key, label, value }) => (
                <MetricCard
                  key={key}
                  label={label}
                  value={value as number | string | null}
                />
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
            title="Training Summary"
            subtitle="Hyperparameters used during training"
          />
          <div className="mt-3">
            <TrainingSummaryCard
              trainingSummary={trainingSummary}
              configUsed={output?.config_used}
            />
          </div>
        </div>
      </div>

      {lossHistory.length > 0 && (
        <div>
          <SectionHeader
            title="Loss Curve"
            subtitle={`${lossHistory.length} epoch${lossHistory.length === 1 ? "" : "s"}`}
          />
          <div className="mt-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
            <LossCurveChart lossHistory={lossHistory} />
          </div>
        </div>
      )}

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
            <div className="max-h-52 overflow-auto">
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

      <div>
        <SectionHeader
          title="Generated Code"
          subtitle="Exportable Python pipeline code"
        />
        <div className="mt-3">
          <GeneratedCodePanel code={generatedCode} embedded />
        </div>
      </div>
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
  const { activeTab, setActiveTab, latestResult, loading, error } =
    useOutputStore();

  return (
    <div className="w-full h-full px-5 py-4 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          Execution Dashboard
        </p>
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
      {activeTab === "code" && (
        <GeneratedCodePanel code={latestResult?.generated_code ?? ""} />
      )}
      {activeTab === "compare" && <CompareRunsTab />}
      {error && activeTab !== "results" && (
        <div className="mt-4">
          <ValidationErrorBanner />
        </div>
      )}
    </div>
  );
}
