import { isPlainObject } from "@rectify/shared/utilities";
import { RECTIFY_ELEMENT_TYPE } from "./RectifyConfigs";
import {
  RectifyElementProps,
  RectifyElementType,
  RectifyElement,
} from "./RectifyTypes";

const RectifyElementJsx = <P = Record<string, any>, K = any>(
  type: RectifyElementType,
  props?: RectifyElementProps<P, K>,
): RectifyElement => {
  return {
    $$typeof: RECTIFY_ELEMENT_TYPE,
    type,
    props,
    key: isPlainObject(props) ? (props.key ?? null) : null,
    ref: isPlainObject(props) ? (props.ref ?? null) : null,
  };
};

export const jsx = (type: any, props?: any) => {
  return RectifyElementJsx(type, props);
};
