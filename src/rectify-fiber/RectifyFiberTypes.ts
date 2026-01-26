import {
  RectifyElementKey,
  RectifyElementProps,
  RectifyElementRefObject,
  RectifyElementType,
} from "@rectify/core/RectifyTypes";
import { RectifyFiberTags } from "./RectifyFiberTags";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { RectifyHook } from "@rectify/rectify-hook/RectifyHookTypes";

export type Fiber = {
  root: FiberRoot | null;
  tag: RectifyFiberTags;
  type: RectifyElementType | null;
  flags: RectifyFiberFlags;
  stateNode: Element | Text | null;
  alternate: Fiber | null;
  isAlternate: boolean;
  ref: RectifyElementRefObject | null;
  key: RectifyElementKey;
  props: RectifyElementProps;
  memorizedProps: RectifyElementProps;
  return: Fiber | null;
  firstChild: Fiber | null;
  sibling: Fiber | null;
  index: number | null;
  memorizedHook: RectifyHook<any> | null;
};

export type FiberRoot = {
  current: Fiber;
  container: Element;
};
