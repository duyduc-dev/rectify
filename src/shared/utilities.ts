export const isArray = (v: unknown) => Array.isArray(v);

export const isString = (v: unknown) => typeof v === "string";

export const isNumber = (v: unknown) => typeof v === "number";

export const isFunction = (v: unknown) => typeof v === "function";

export const toArray = <T>(v: T | T[]) => (isArray(v) ? v : [v]);

export const isPlainObject = (v: unknown): v is Record<string, any> => {
  if (typeof v !== "object" || v === null) return false;

  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

export const isIterable = (v: unknown): v is Iterable<unknown> => {
  return v != null && typeof (v as any)[Symbol.iterator] === "function";
};

export const isTextNode = (v: unknown) => isString(v) || isNumber(v);
