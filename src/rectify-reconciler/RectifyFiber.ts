import { RectifyElement, RectifyKey } from "@rectify/core";
import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import {
  RECTIFY_ELEMENT_TYPE,
  RECTIFY_TEXT_TYPE,
} from "@rectify/core/RectifyElementConstants";
import { isTextNode } from "@rectify/shared/utilities";
import { isValidRectifyElement } from "@rectify/core/RectifyCoreService";

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
    __type__: isTextNode(pendingProps)
      ? RECTIFY_TEXT_TYPE
      : RECTIFY_ELEMENT_TYPE,
    workTag,
    index: 0,
    pendingProps,
    key,
    flags: RectifyFiberFlags.NoFlags,
    memoizedProps: null,
    stateNode: null,
    type: null,
    alternate: null,
    child: null,
    sibling: null,
    return: null,
    deletions: null,
    hooks: null,
    effects: null,
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

  wip.memoizedProps = current.memoizedProps;
  wip.return = current.return;
  wip.child = current.child;
  wip.sibling = current.sibling;
  wip.index = current.index;

  return wip;
};

const createFiberFromRectifyElement = (node: RectifyElement) => {
  if (isValidRectifyElement(node) && isTextNode(node.props)) {
    const f = createFiber(RectifyFiberWorkTag.HostText, node.props, node.key);
    f.__type__ = RECTIFY_TEXT_TYPE;
    return f;
  }

  const type = node.type;
  const tag =
    typeof type === "function"
      ? RectifyFiberWorkTag.FunctionComponent
      : RectifyFiberWorkTag.HostComponent;

  return createFiber(tag, node.props, node.key);
};

export function createDomFromRectifyElement(vnode: RectifyElement): Node {
  if (isValidRectifyElement(vnode) && isTextNode(vnode.props)) {
    return document.createTextNode(String(vnode.props));
  }
  return document.createElement(vnode.type as string);
}

export { createFiber, createWorkInProgress, createFiberFromRectifyElement };
