export function isObject(value: unknown) {
  return typeof value === "object";
}

export function isPlainObject<T = Record<string, unknown>>(
  value: unknown,
): value is T {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

export const isFunction = (v: unknown): v is Function =>
  typeof v === "function";

export const isString = (v: unknown): v is string => typeof v === "string";

export const isNumber = (v: unknown): v is number => typeof v === "number";

export const isText = (v: unknown): v is string | number =>
  isNumber(v) || isString(v);

export const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
