import { isBool } from "@rectify/shared/utilities";
import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_FRAGMENT_TYPE,
  RECTIFY_TEXT_TYPE,
} from "./RectifyElementConstants";
import {
  RectifyElement,
  RectifyIgnorable,
  RectifyKey,
  RectifyText,
} from "./RectifyTypes";

export const isValidRectifyElement = (v: unknown): v is RectifyElement => {
  const vAny = v as any;
  const elementType = [
    RECTIFY_ELEMENT_TYPE,
    RECTIFY_TEXT_TYPE,
    RECTIFY_FRAGMENT_TYPE,
  ];
  return elementType.includes(vAny?.__type__);
};

export const toTextNodeElement = (v: RectifyText): RectifyElement => {
  return {
    __type__: RECTIFY_TEXT_TYPE,
    key: null,
    type: null,
    props: v,
    index: 0,
  };
};

export const toFragmentElement = (
  children: unknown,
  pendingProps: any = {},
): RectifyElement => {
  return {
    __type__: RECTIFY_FRAGMENT_TYPE,
    key: extractKeyFromProps(pendingProps),
    type: null,
    props: { ...pendingProps, children },
    index: 0,
  };
};

export const isRectifyIgnorable = (v: unknown): v is RectifyIgnorable =>
  v === null || v === undefined || isBool(v);

export const extractKeyFromProps = (
  props: any,
  keyElement?: RectifyKey,
): RectifyKey => {
  const key = props?.key ?? keyElement;
  return key;
};

export const isRectifyElement = (v: unknown, type?: symbol) => {
  if (!isValidRectifyElement(v)) return false;
  return type ? v.__type__ === type : true;
};
