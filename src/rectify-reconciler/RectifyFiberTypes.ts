import { RectifyKey } from "@rectify/core";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { RectifyElementType } from "@rectify/core/RectifyTypes";

/**
 * RectifyFiber to control dom
 */
export type RectifyFiber = {
  /**
   * A fiber alternate with current fiber
   */
  alternate: RectifyFiber | null;

  /**
   * Type of the component such as h1, h2 or the function component
   */
  type: RectifyElementType;

  /**
   * To determine this fiber is host root, host component, ..etc.
   */
  workTag: RectifyFiberWorkTag;

  /**
   * To determine behavior of current fiber
   */
  flags: RectifyFiberFlags;

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
   * Fiber will be delete in DOM
   */
  deletions: Iterable<RectifyFiber> | null;

  /**
   * Next props
   */
  pendingProps: unknown;

  /**
   * prev props
   */
  memoizedProps: unknown;

  /**
   * Key of fiber
   */
  key: RectifyKey;

  /**
   * Point to node in dom
   */
  stateNode: Element | Text | null;
};
