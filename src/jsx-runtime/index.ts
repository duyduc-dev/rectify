import { RectifyJSXElement } from "@rectify/rectify/RectifyJSX";
import {
  RectifyElementType,
  Key,
  RectifyElement,
} from "@rectify/rectify/RectifyTypes";

export function jsx(
  type: RectifyElementType,
  props?: unknown,
  key?: Key,
): RectifyElement {
  return RectifyJSXElement(type, props, key ?? null);
}
