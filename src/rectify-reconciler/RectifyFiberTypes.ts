import { RectifyKey } from "@rectify/core";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";

/**
 * RectifyFiber to control dom
 */
export type RectifyFiber = {
  /**
   * To determine this fiber is host root, host component, ..etc.
   */
  workTag: RectifyFiberWorkTag;

  /**
   * Post to first child
   */
  child: RectifyFiber | null;

  /**
   * Point to next fiber in the same level
   */
  sibling: RectifyFiber | null;

  /**
   * Point to parent of current fiber
   */
  return: RectifyFiber | null;

  /**
   * Position in current level
   */
  index: number;

  /**
   * Next props
   */
  pendingProps: unknown;

  /**
   * Key of fiber
   */
  key: RectifyKey
};
