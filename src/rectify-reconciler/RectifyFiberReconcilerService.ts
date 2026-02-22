import { isPlainObject, isTextNode } from "@rectify/shared/utilities";

const CHILDREN_KEY = "children";

const areObjectsEqual = (
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean => {
  const aKeys = Object.keys(a).filter((k) => k !== CHILDREN_KEY);
  const bKeys = Object.keys(b).filter((k) => k !== CHILDREN_KEY);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }

  return true;
};

export const hasPropsChanged = (
  oldProps: unknown,
  nextProps: unknown,
): boolean => {
  if (oldProps === nextProps) return false;

  if (isPlainObject(oldProps) && isPlainObject(nextProps)) {
    return !areObjectsEqual(oldProps, nextProps);
  }

  if (isTextNode(oldProps) && isTextNode(nextProps)) {
    return oldProps !== nextProps;
  }

  return true;
};
