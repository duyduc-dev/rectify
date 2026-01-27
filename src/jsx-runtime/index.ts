export function jsx(
  type: RectifyElementType,
  props: unknown,
  key?: Key,
): RectifyElement {
  return {
    type,
    props,
    key: key ?? null,
  };
}
