"use client";

type PredictionDistributionChartProps = {
  values: number[];
};

export default function PredictionDistributionChart({
  values,
}: PredictionDistributionChartProps) {
  if (!values.length) return null;

  const bins = 8;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const counts = Array(bins).fill(0);
  values.forEach((v) => {
    const idx = Math.min(bins - 1, Math.floor(((v - min) / range) * bins));
    counts[idx] += 1;
  });
  const maxCount = Math.max(...counts, 1);
  const barWidth = 28;
  const gap = 6;
  const chartHeight = 100;
  const width = bins * (barWidth + gap) + 32;
  const height = chartHeight + 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[200px]">
      {counts.map((count, i) => {
        const barH = (count / maxCount) * chartHeight;
        const x = 24 + i * (barWidth + gap);
        const y = chartHeight - barH + 8;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx={3}
            fill="#6366f1"
            opacity={0.8}
          />
        );
      })}
      <text
        x={width / 2}
        y={height - 6}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={10}
      >
        Prediction Value
      </text>
    </svg>
  );
}
