import { create } from "zustand";

type MetricsMap = Record<string, number | string | null>;

type RunSummary = {
  model?: string;
  task_type?: string;
};

type PipelineOutput = {
  model_name?: string;
  predictions?: unknown[];
  predictions_preview?: unknown[];
  metrics?: MetricsMap;
  config_used?: Record<string, unknown>;
  training_summary?: Record<string, unknown>;
  loss_history?: number[];
  run_summary?: RunSummary;
};

export type PipelineExecutionResult = {
  status?: string;
  execution_time?: number;
  final_node?: string;
  pipeline_summary?: {
    total_nodes?: number;
    total_edges?: number;
  };
  output?: PipelineOutput;
  generated_code?: string;
};

export type SavedRun = {
  id: string;
  timestamp: string;
  modelName: string;
  taskType: string;
  metrics: MetricsMap;
  configUsed: Record<string, unknown>;
  executionTime: number;
};

type OutputTab = "results" | "code" | "compare";

interface OutputStore {
  latestResult: PipelineExecutionResult | null;
  loading: boolean;
  error: string | null;
  errorNodeId: string | null;
  errorNodeType: string | null;
  activeTab: OutputTab;
  savedRuns: SavedRun[];
  selectedCompareIds: string[];
  startExecution: () => void;
  setExecutionResult: (result: PipelineExecutionResult) => void;
  setExecutionError: (payload: { message: string; nodeId?: string | null; nodeType?: string | null }) => void;
  setActiveTab: (tab: OutputTab) => void;
  saveRun: (run: SavedRun) => void;
  toggleCompareRun: (id: string) => void;
}

export const useOutputStore = create<OutputStore>((set) => ({
  latestResult: null,
  loading: false,
  error: null,
  errorNodeId: null,
  errorNodeType: null,
  activeTab: "results",
  savedRuns: [],
  selectedCompareIds: [],
  startExecution: () =>
    set(() => ({
      loading: true,
      error: null,
      errorNodeId: null,
      errorNodeType: null,
      latestResult: null,
      activeTab: "results",
    })),
  setExecutionResult: (result) =>
    set(() => ({
      latestResult: result,
      loading: false,
      error: null,
      errorNodeId: null,
      errorNodeType: null,
      activeTab: "results",
    })),
  setExecutionError: ({ message, nodeId, nodeType }) =>
    set(() => ({
      error: message,
      loading: false,
      errorNodeId: nodeId ?? null,
      errorNodeType: nodeType ?? null,
    })),
  setActiveTab: (tab) => set(() => ({ activeTab: tab })),
  saveRun: (run) =>
    set((state) => ({
      savedRuns: [run, ...state.savedRuns],
    })),
  toggleCompareRun: (id) =>
    set((state) => {
      const alreadySelected = state.selectedCompareIds.includes(id);
      if (alreadySelected) {
        return { selectedCompareIds: state.selectedCompareIds.filter((runId) => runId !== id) };
      }
      if (state.selectedCompareIds.length < 2) {
        return { selectedCompareIds: [...state.selectedCompareIds, id] };
      }
      return { selectedCompareIds: [state.selectedCompareIds[1], id] };
    }),
}));
