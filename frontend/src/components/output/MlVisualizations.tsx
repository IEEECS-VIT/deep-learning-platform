"use client";
import type { PipelineOutput } from "@/store/outputStore";
import {
  getTaskType,
  getClassDistribution,
  getPredictedLabels,
  getRegressionPairs,
  getFeatureCount,
} from "@/lib/resultAnalytics";
import LossCurveChart from "./LossCurveChart";
import ClassDistributionChart from "./charts/ClassDistributionChart";
import ActualVsPredictedChart from "./charts/ActualVsPredictedChart";
import ResidualPlotChart from "./charts/ResidualPlotChart";
import PredictionDistributionChart from "./charts/PredictionDistributionChart";

type MlVisualizationsProps = {
  output?: PipelineOutput;
};

export default function MlVisualizations({ output }: MlVisualizationsProps) {
  const taskType = getTaskType(output);
  const lossHistory = output?.loss_history ?? [];
  const predicted = getPredictedLabels(output) ?? [];
  const regressionPairs = getRegressionPairs(output);
  const featureCount = getFeatureCount(output);

  if (lossHistory.length > 0) {
    return <LossCurveChart lossHistory={lossHistory} />;
  }

  if (taskType === "classification") {
    const distribution = getClassDistribution(predicted);
    return (
      <div className="space-y-4">
        {distribution.length > 0 ? (
          <ClassDistributionChart
            data={distribution}
            title="Prediction Distribution"
          />
        ) : null}
        {featureCount != null && (
          <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
              Feature Count
            </p>
            <p className="text-[20px] font-semibold text-white mt-1">
              {featureCount}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (taskType === "regression") {
    if (regressionPairs.length > 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-white/40 mb-2">Actual vs Predicted</p>
            <ActualVsPredictedChart points={regressionPairs} />
          </div>
          <div>
            <p className="text-[11px] text-white/40 mb-2">Residual Plot</p>
            <ResidualPlotChart points={regressionPairs} />
          </div>
        </div>
      );
    }
    if (predicted.length > 0) {
      return <PredictionDistributionChart values={predicted} />;
    }
    if (featureCount != null) {
      return (
        <div className="rounded-lg border border-white/5 bg-white/5 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/40 font-semibold">
            Feature Count Summary
          </p>
          <p className="text-[20px] font-semibold text-white mt-1">
            {featureCount} features
          </p>
        </div>
      );
    }
  }

  if (predicted.length > 0) {
    return <PredictionDistributionChart values={predicted} />;
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#141419] px-4 py-3 text-[12px] text-white/40">
      Visualizations will appear when model outputs are available.
    </div>
  );
}
