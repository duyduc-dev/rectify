import { RectifyElement } from "@rectify/rectify";

const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isText = (value: unknown): value is string | number => {
  return isString(value) || isNumber(value);
};

const isRectifyElement = (value: unknown): value is RectifyElement => {
  return isPlainObject(value) && "type" in value && "$$typeof" in value;
};

const isIterable = (value: unknown): value is Iterable<unknown> => {
  return (
    typeof value === "object" && value !== null && Symbol.iterator in value
  );
};

const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

export {
  isString,
  isNumber,
  isPlainObject,
  isRectifyElement,
  isText,
  isIterable,
  isFunction,
};
