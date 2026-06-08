"use client";

const SUMMARY_KEYS = [
  { key: "epochs", label: "Epochs" },
  { key: "batch_size", label: "Batch Size" },
  { key: "optimizer", label: "Optimizer" },
  { key: "learning_rate", label: "Learning Rate" },
  { key: "hidden_size", label: "Hidden Size" },
  { key: "architecture", label: "Architecture" },
  { key: "filters", label: "Filters" },
] as const;

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "-";
  return String(value);
};

type TrainingSummaryCardProps = {
  trainingSummary?: Record<string, unknown>;
  configUsed?: Record<string, unknown>;
};

export default function TrainingSummaryCard({
  trainingSummary,
  configUsed,
}: TrainingSummaryCardProps) {
  const source = trainingSummary ?? configUsed ?? {};
  const entries = SUMMARY_KEYS.filter(
    ({ key }) => source[key] !== undefined && source[key] !== null,
  );

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
        Training summary is not available for this run.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {entries.map(({ key, label }) => (
        <div
          key={key}
          className="bg-[#15151b] border border-white/5 rounded-xl px-4 py-3 flex flex-col gap-1"
        >
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
            {label}
          </span>
          <span className="text-[16px] font-semibold text-white capitalize">
            {formatValue(source[key])}
          </span>
        </div>
      ))}
    </div>
  );
}
