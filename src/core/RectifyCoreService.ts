import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_TEXT_TYPE,
} from "./RectifyElementConstants";
import { RectifyElement, RectifyText } from "./RectifyTypes";

export const isValidRectifyElement = (v: unknown): v is RectifyElement => {
  const vAny = v as any;
  return (
    vAny?.__type__ === RECTIFY_ELEMENT_TYPE ||
    vAny?.__type__ === RECTIFY_TEXT_TYPE
  );
};

export const toTextNodeElement = (v: RectifyText): RectifyElement => {
  return {
    __type__: RECTIFY_TEXT_TYPE,
    key: null,
    type: null,
    props: v,
  };
};

export const isValidRectifyTextElement = (v: unknown): v is RectifyElement => {
  const vAny = v as any;
  return vAny?.__type__ === RECTIFY_TEXT_TYPE;
};
