export type ConfigFieldSchema = {
  type?: string;
  label?: string;
  options?: string[];
  default?: unknown;
  min?: number;
  max?: number;
  visible_if?: Record<string, unknown[] | unknown>;
  option_groups?: Record<string, string[]>;
};

export type ConfigSchemaMap = Record<string, ConfigFieldSchema>;

export type NodeMetadataEntry = {
  display_name?: string;
  description?: string;
  inputs?: string[];
  outputs?: string[];
  config_schema?: ConfigSchemaMap;
};

export const areConfigsEqual = (
  left: Record<string, unknown>,
  right: Record<string, unknown>,
) => {
  const leftKeys = Object.keys(left);
  if (leftKeys.length !== Object.keys(right).length) return false;
  return leftKeys.every((key) => Object.is(left[key], right[key]));
};

export const getConfigValue = (
  schema: ConfigSchemaMap,
  config: Record<string, unknown>,
  key: string,
) => {
  if (Object.prototype.hasOwnProperty.call(config, key)) return config[key];
  return schema[key]?.default;
};

export const shouldRenderField = (
  schema: ConfigSchemaMap,
  field: ConfigFieldSchema,
  config: Record<string, unknown>,
) => {
  if (!field.visible_if) return true;
  return Object.entries(field.visible_if).every(([key, allowed]) => {
    const currentValue = getConfigValue(schema, config, key);
    if (Array.isArray(allowed)) return allowed.includes(currentValue);
    return currentValue === allowed;
  });
};

export const normalizeConfig = (
  schema: ConfigSchemaMap,
  config: Record<string, unknown>,
) => {
  const nextConfig: Record<string, unknown> = {};
  Object.entries(schema).forEach(([key, field]) => {
    if (!shouldRenderField(schema, field, config)) return;
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      nextConfig[key] = config[key];
      return;
    }
    if (field.default !== undefined) {
      nextConfig[key] = field.default;
    }
  });
  return nextConfig;
};

export const buildDefaultConfig = (schema: ConfigSchemaMap) =>
  normalizeConfig(schema, {});
