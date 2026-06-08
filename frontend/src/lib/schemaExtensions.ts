import type { ConfigFieldSchema, ConfigSchemaMap } from "./configSchema";

/**
 * Frontend-only schema extensions for fields the backend schema does not yet
 * annotate with visible_if. Keeps architecture-specific UI rules isolated.
 */
const FIELD_EXTENSIONS: Record<string, Record<string, Partial<ConfigFieldSchema>>> = {
  neural_network: {
    hidden_size: {
      visible_if: { architecture: ["mlp"] },
    },
    epochs: {
      label: "Epochs",
    },
    learning_rate: {
      label: "Learning Rate",
    },
  },
  dataset: {
    dataset: {
      label: "Dataset",
    },
  },
};

export const mergeSchemaExtensions = (
  nodeType: string,
  schema: ConfigSchemaMap,
): ConfigSchemaMap => {
  const extensions = FIELD_EXTENSIONS[nodeType];
  if (!extensions) return schema;

  const merged: ConfigSchemaMap = {};
  for (const [key, field] of Object.entries(schema)) {
    merged[key] = { ...field, ...extensions[key] };
  }
  return merged;
};
