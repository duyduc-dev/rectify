import { RECTIFY_ELEMENT_TYPE } from "./RectifyElementConstants";
import { RectifyElement, RectifyElementType, RectifyKey } from "./RectifyTypes";
import { withNormalizeProps } from "./RectifyInternalHOC";

/**
 * Create element function to create a Rectify element
 * @param type
 * @param props
 * @param key
 */
export const createElement = (
  type: RectifyElementType,
  props: unknown = null,
  key: RectifyKey = null,
): RectifyElement => {
  // Determine the element key
  const elementKey = key ? key : ((props as any)?.key ?? null);

  return {
    __type__: RECTIFY_ELEMENT_TYPE,
    key: elementKey,
    type,
    props: withNormalizeProps(props),
  };
};

/**
 * Synthetic JSX function to create Rectify elements
 * @param type
 * @param props
 * @param key
 * @returns
 */
export const jsx = (
  type: RectifyElementType,
  props?: unknown,
  key?: RectifyKey,
) => {
  return createElement(type, props, key);
};
