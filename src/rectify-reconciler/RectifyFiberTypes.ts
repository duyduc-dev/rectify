import { Key, RectifyElementType } from "@rectify/rectify/RectifyTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { HookState } from "@rectify/rectify-hook/RectifyHookTypes";

export type Fiber = {
  tag: RectifyFiberWorkTag;
  type: RectifyElementType | null;
  flags: RectifyFiberFlags;

  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  index: number;

  key: Key | null;

  pendingProps: any;
  memoizedProps: any;

  pendingState: HookState | null;

  stateNode: Element | Text | null | undefined;

  alternate: Fiber | null;
};
