"use client";
import { buildPredictionRows } from "@/lib/resultAnalytics";
import type { PipelineOutput } from "@/store/outputStore";

const formatCell = (value: string | null) => value ?? "—";

type PredictionsPreviewTableProps = {
  output?: PipelineOutput;
};

export default function PredictionsPreviewTable({
  output,
}: PredictionsPreviewTableProps) {
  const rows = buildPredictionRows(output);
  const hasActual = rows.some((r) => r.actual !== null);

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
        Predictions preview will appear after execution.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <div className="max-h-52 overflow-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-[#141419] text-white/50 sticky top-0">
            <tr>
              <th className="px-3 py-2 font-semibold">#</th>
              {hasActual && (
                <th className="px-3 py-2 font-semibold">Actual</th>
              )}
              <th className="px-3 py-2 font-semibold">Predicted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.index} className="text-white/80">
                <td className="px-3 py-2 text-white/40">{row.index}</td>
                {hasActual && (
                  <td className="px-3 py-2">{formatCell(row.actual)}</td>
                )}
                <td className="px-3 py-2">{row.predicted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
