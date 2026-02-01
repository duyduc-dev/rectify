import { RECTIFY_ELEMENT_TYPE } from "./RectifyConfigs";
import { Key, RectifyElement, RectifyElementType } from "./RectifyTypes";

export const RectifyJSXElement = (
  type: RectifyElementType,
  props: unknown,
  key: Key | null,
): RectifyElement => {
  return {
    $$typeof: RECTIFY_ELEMENT_TYPE,
    type,
    props,
    key,
  };
};
