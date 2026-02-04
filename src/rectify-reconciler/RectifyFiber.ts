import { RectifyKey } from "@rectify/core";
import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import { RectifyFiberFlags } from "./RectifyFiberFlags";

/**
 * Create a fiber 
 * @param workTag 
 * @param pendingProps 
 * @param key 
 * @returns 
 */
const createFiber = (
  workTag: RectifyFiberWorkTag,
  pendingProps: unknown = null,
  key: RectifyKey = null,
): RectifyFiber => {
  return {
    workTag,
    index: 0,
    pendingProps,
    key,
    flags: RectifyFiberFlags.NoFlags,
    stateNode: null,
    type: null,
    alternate: null,
    child: null,
    sibling: null,
    return: null,
    deletions: null,
  };
};

/**
 * Create a fiber can be replace be current fiber
 * @param current 
 * @param pendingProps 
 * @returns 
 */
const createWorkInProgress = (
  current: RectifyFiber,
  pendingProps: unknown,
): RectifyFiber => {
  let wip = current.alternate;

  if (!wip) {
    wip = createFiber(current.workTag, pendingProps, current.key);
    wip.type = current.type;
    wip.stateNode = current.stateNode;

    wip.alternate = current;
    current.alternate = wip;
  } else {
    wip.pendingProps = pendingProps;
    wip.flags = RectifyFiberFlags.NoFlags;
    wip.deletions = null;
  }

  wip.return = null;
  wip.child = null;
  wip.sibling = null;
  wip.index = 0;

  return wip;
};

export { createFiber, createWorkInProgress };
