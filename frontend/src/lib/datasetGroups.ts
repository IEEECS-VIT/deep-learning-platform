export type DatasetGroup = {
  label: string;
  options: string[];
};

const TABULAR_DATASETS = [
  "iris",
  "wine",
  "breast_cancer",
  "diabetes",
  "california_housing",
];

const IMAGE_DATASETS = [
  "digits",
  "mnist",
  "fashion_mnist",
  "cifar10",
];

const KNOWN_DATASETS = new Set([...TABULAR_DATASETS, ...IMAGE_DATASETS]);

export const buildDatasetGroups = (options: string[]): DatasetGroup[] => {
  const groups: DatasetGroup[] = [];

  const tabular = options.filter((o) => TABULAR_DATASETS.includes(o));
  const image = options.filter((o) => IMAGE_DATASETS.includes(o));
  const other = options.filter((o) => !KNOWN_DATASETS.has(o));

  if (tabular.length) groups.push({ label: "Tabular", options: tabular });
  if (image.length) groups.push({ label: "Image", options: image });
  if (other.length) groups.push({ label: "Other", options: other });

  return groups;
};

export const formatDatasetLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
