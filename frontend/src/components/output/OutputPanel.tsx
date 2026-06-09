"use client";
import { useMemo } from "react";
import {
  useOutputStore,
  buildSavedRun,
  type SavedRun,
} from "@/store/outputStore";
import { useToastStore } from "@/store/toastStore";
import {
  getMetricCards,
  getTaskType,
  getConfusionMatrixData,
  resolvePipelineStatus,
  statusLabel,
} from "@/lib/resultAnalytics";
import TrainingSummaryCard from "./TrainingSummaryCard";
import GeneratedCodePanel from "./GeneratedCodePanel";
import ValidationErrorBanner from "./ValidationErrorBanner";
import MlVisualizations from "./MlVisualizations";
import PredictionsPreviewTable from "./PredictionsPreviewTable";
import CompareLossCurves from "./CompareLossCurves";
import ConfusionMatrixHeatmap from "./charts/ConfusionMatrixHeatmap";

const tabs = [
  { id: "results", label: "Results" },
  { id: "code", label: "Code Export" },
  { id: "compare", label: "Compare Runs" },
] as const;

type TabId = (typeof tabs)[number]["id"];

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
  pipelineStatus,
  executionTime,
}: {
  pipelineStatus: ReturnType<typeof resolvePipelineStatus>;
  executionTime?: number;
}) => {
  const styles: Record<string, string> = {
    running:
      "border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.15)] text-[#93c5fd]",
    success:
      "border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.15)] text-[#34d399]",
    failed:
      "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.15)] text-[#f87171]",
    idle: "border-white/10 bg-white/5 text-white/40",
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`text-[11px] rounded-full px-2.5 py-0.5 border ${styles[pipelineStatus]}`}
        >
          {statusLabel[pipelineStatus]}
        </span>
        {pipelineStatus === "running" && (
          <span className="h-4 w-4 rounded-full border-2 border-white/10 border-t-[#7c3aed] animate-spin" />
        )}
      </div>
      <span className="text-[12px] text-white/50">
        Execution Time:{" "}
        <span className="text-white/80 font-medium">
          {executionTime != null ? `${executionTime.toFixed(3)}s` : "—"}
        </span>
      </span>
    </div>
  );
};

const EmptySection = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
    {message}
  </div>
);

const ResultsTab = () => {
  const { latestResult, loading, error, saveRun } = useOutputStore();
  const addToast = useToastStore((state) => state.addToast);
  const output = latestResult?.output;
  const runMetadata = latestResult?.runMetadata;
  const pipelineStatus = resolvePipelineStatus(
    loading,
    error,
    latestResult?.status,
  );
  const metricCards = useMemo(() => getMetricCards(output), [output]);
  const taskType = getTaskType(output);
  const confusionMatrix = getConfusionMatrixData(output);
  const hasResult = Boolean(latestResult && !error && !loading);
  const canSaveRun = Boolean(latestResult && !error && !loading);

  const handleSaveRun = () => {
    if (latestResult && canSaveRun) {
      const run = buildSavedRun(latestResult);
      if (run) {
        saveRun(run);
        addToast("Run saved to experiment history!");
      }
    }
  };

  const vizTitle =
    output?.loss_history?.length
      ? "Training Loss Curve"
      : taskType === "classification"
        ? "Classification Visualizations"
        : taskType === "regression"
          ? "Regression Visualizations"
          : "Model Visualizations";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBar
          pipelineStatus={pipelineStatus}
          executionTime={latestResult?.execution_time}
        />
        {hasResult && (
          <button
            onClick={handleSaveRun}
            disabled={!canSaveRun}
            className="h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[12px] text-white/80 hover:text-white hover:bg-white/10"
          >
            Save Run
          </button>
        )}
      </div>

      {pipelineStatus === "failed" && <ValidationErrorBanner />}

      {pipelineStatus === "idle" && (
        <EmptySection message="Build a pipeline on the canvas and click Run Pipeline to see metrics, visualizations, and predictions here." />
      )}

      {pipelineStatus === "running" && (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5" />
            ))}
          </div>
          <div className="h-32 rounded-xl bg-white/5" />
          <div className="h-40 rounded-xl bg-white/5" />
        </div>
      )}

      <div>
        <SectionHeader
          title="Metrics"
          subtitle={
            hasResult
              ? taskType === "classification"
                ? "Classification performance"
                : taskType === "regression"
                  ? "Regression performance"
                  : "Model performance"
              : "Awaiting pipeline execution"
          }
        />
        <div className="mt-3">
          {hasResult && metricCards.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metricCards.map(({ key, label, value }) => (
                <MetricCard
                  key={key}
                  label={label}
                  value={value as number | string | null}
                />
              ))}
            </div>
          ) : (
            <EmptySection
              message={
                pipelineStatus === "failed"
                  ? "Metrics unavailable due to pipeline failure."
                  : "Metrics will populate after a successful run."
              }
            />
          )}
        </div>
      </div>

      {taskType === "classification" && (
        <div>
          <SectionHeader
            title="Confusion Matrix"
            subtitle={
              confusionMatrix
                ? "Classification error breakdown"
                : "Requires actual labels in pipeline output"
            }
          />
          <div className="mt-3">
            {hasResult && confusionMatrix ? (
              <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
                <ConfusionMatrixHeatmap data={confusionMatrix} />
              </div>
            ) : (
              <EmptySection
                message={
                  hasResult
                    ? "Confusion matrix will render when actual and predicted labels are available."
                    : "Confusion matrix appears for classification tasks after execution."
                }
              />
            )}
          </div>
        </div>
      )}

      <div>
        <SectionHeader
          title="Training Summary"
          subtitle="Model and hyperparameter configuration"
        />
        <div className="mt-3">
          <TrainingSummaryCard output={output} runMetadata={runMetadata} />
        </div>
      </div>

      <div>
        <SectionHeader title="Visualizations" subtitle={vizTitle} />
        <div className="mt-3 rounded-xl border border-white/5 bg-[#141419] px-4 py-3">
          {hasResult ? (
            <MlVisualizations output={output} />
          ) : (
            <EmptySection message="Loss curves, distribution charts, and regression plots appear here based on model type." />
          )}
        </div>
      </div>

      <div>
        <SectionHeader
          title="Predictions Preview"
          subtitle="Sample model outputs on test data"
        />
        <div className="mt-3">
          {hasResult ? (
            <PredictionsPreviewTable output={output} />
          ) : (
            <EmptySection message="First predictions will be shown in a table with actual and predicted values when available." />
          )}
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

  if (!savedRuns.length) {
    return (
      <EmptySection message="Run history is empty. Execute a pipeline to automatically track experiments here." />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Run History"
        subtitle="Select runs to compare metrics and training curves"
      />
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-[#141419] text-white/50">
            <tr>
              <th className="px-3 py-2 font-semibold w-10" />
              <th className="px-3 py-2 font-semibold">Dataset</th>
              <th className="px-3 py-2 font-semibold">Model</th>
              <th className="px-3 py-2 font-semibold">Accuracy</th>
              <th className="px-3 py-2 font-semibold">Loss</th>
              <th className="px-3 py-2 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {savedRuns.map((run) => (
              <tr key={run.id} className="text-white/80">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedCompareIds.includes(run.id)}
                    onChange={() => toggleCompareRun(run.id)}
                    className="accent-violet-500"
                  />
                </td>
                <td className="px-3 py-2 capitalize">{run.dataset}</td>
                <td className="px-3 py-2 capitalize">{run.modelName}</td>
                <td className="px-3 py-2">
                  {formatMetricValue(run.metrics.accuracy)}
                </td>
                <td className="px-3 py-2">
                  {formatMetricValue(run.metrics.loss)}
                </td>
                <td className="px-3 py-2 text-white/50">
                  {new Date(run.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRuns.length > 0 && (
        <>
          <CompareLossCurves runs={selectedRuns} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {selectedRuns.map((run) => (
              <RunCompareCard
                key={run.id}
                run={run}
                bestMetrics={bestMetrics}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const RunCompareCard = ({
  run,
  bestMetrics,
}: {
  run: SavedRun;
  bestMetrics: Record<string, number>;
}) => (
  <div className="rounded-xl border border-white/5 bg-[#141419] p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[16px] font-semibold text-white capitalize">
          {run.modelName}
        </p>
        <p className="text-[12px] text-white/50 capitalize">
          {run.dataset} · {run.taskType}
        </p>
      </div>
      <div className="text-right text-[12px] text-white/50">
        <p>{new Date(run.timestamp).toLocaleString()}</p>
        <p className="text-white/70 font-medium mt-0.5">
          {run.executionTime.toFixed(3)}s
        </p>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2">
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
    <div className="mt-4 space-y-1 text-[12px]">
      {Object.entries(run.configUsed).slice(0, 6).map(([k, v]) => (
        <div key={k} className="flex items-center justify-between text-white/70">
          <span className="text-white/40">{k}</span>
          <span>{formatCellValue(v)}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function OutputPanel() {
  const { activeTab, setActiveTab, latestResult, loading, error } =
    useOutputStore();

  return (
    <div className="w-full h-full px-5 py-4 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          Output Panel
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
      {error && activeTab === "code" && (
        <div className="mt-4">
          <ValidationErrorBanner />
        </div>
      )}
    </div>
  );
}
