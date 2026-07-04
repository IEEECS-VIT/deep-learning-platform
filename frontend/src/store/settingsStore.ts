import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CanvasSettings = {
  apiUrl: string;
  canvasBackground: "dots" | "lines" | "none";
  animateEdges: boolean;
  edgeWidth: number;
  snapToGrid: boolean;
  snapGrid: number;
  minimap: boolean;
  showControls: boolean;
  connectionLineStyle: "bezier" | "straight" | "step";
  autoSaveInterval: number;
  showNodeLabels: boolean;
  showNodeSummaries: boolean;
  defaultZoom: number;
};

export const defaultCanvasSettings: CanvasSettings = {
  apiUrl: "http://localhost:8000",
  canvasBackground: "dots",
  animateEdges: false,
  edgeWidth: 1.5,
  snapToGrid: false,
  snapGrid: 15,
  minimap: true,
  showControls: true,
  connectionLineStyle: "bezier",
  autoSaveInterval: 0,
  showNodeLabels: true,
  showNodeSummaries: true,
  defaultZoom: 1,
};

interface SettingsStore {
  settings: CanvasSettings;
  updateSetting: <K extends keyof CanvasSettings>(
    key: K,
    value: CanvasSettings[K],
  ) => void;
  updateSettings: (next: Partial<CanvasSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultCanvasSettings,
      updateSetting: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        })),
      updateSettings: (next) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...next,
          },
        })),
      resetSettings: () => set(() => ({ settings: defaultCanvasSettings })),
    }),
    {
      name: "ml_settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
