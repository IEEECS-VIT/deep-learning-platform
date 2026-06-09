"use client";
import {
  getDatasetName,
  getModelType,
} from "@/lib/resultAnalytics";
import type { PipelineOutput } from "@/store/outputStore";

const SUMMARY_KEYS = [
  { key: "model_type", label: "Model Type" },
  { key: "dataset", label: "Dataset" },
  { key: "epochs", label: "Epochs" },
  { key: "learning_rate", label: "Learning Rate" },
  { key: "batch_size", label: "Batch Size" },
  { key: "optimizer", label: "Optimizer" },
] as const;

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "-";
  return String(value);
};

type TrainingSummaryCardProps = {
  output?: PipelineOutput;
  runMetadata?: { dataset?: string };
};

export default function TrainingSummaryCard({
  output,
  runMetadata,
}: TrainingSummaryCardProps) {
  const trainingSummary = output?.training_summary ?? {};
  const configUsed = output?.config_used ?? {};
  const source = { ...configUsed, ...trainingSummary };

  const entries = SUMMARY_KEYS.map((item) => {
    const { key, label } = item;
    if (key === "model_type") {
      return { key, label, value: getModelType(output) };
    }
    if (key === "dataset") {
      return { key, label, value: getDatasetName(output, runMetadata) };
    }
    const value = source[key];
    if (value === undefined || value === null) return null;
    return { key, label, value };
  }).filter(Boolean) as Array<{ key: string; label: string; value: unknown }>;

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
        Training configuration will appear after a successful run.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map(({ key, label, value }) => (
        <div
          key={key}
          className="bg-[#15151b] border border-white/5 rounded-xl px-4 py-3 flex flex-col gap-1"
        >
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
            {label}
          </span>
          <span className="text-[16px] font-semibold text-white capitalize">
            {formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
