import { Key, RectifyNode } from "@rectify/rectify/RectifyTypes";
import {
  FunctionComponent,
  HostComponent,
  HostText,
  RectifyFiberWorkTag,
} from "./RectifyFiberWorkTag";
import { Fiber } from "./RectifyFiberTypes";
import {
  isIterable,
  isRectifyElement,
  isString,
  isText,
} from "@rectify/shared/utilities";
import { RectifyFiberFlags } from "./RectifyFiberFlags";

const createFiber = (
  tag: RectifyFiberWorkTag,
  pendingProps: unknown,
  key: Key | null,
): Fiber => {
  return {
    tag,
    flags: RectifyFiberFlags.None,
    type: null,
    child: null,
    sibling: null,
    return: null,
    key,
    index: 0,
    pendingProps,
    memoizedProps: null,
    stateNode: null,
    alternate: null,
    pendingState: null,
  };
};

const createFiberWorkInProgress = (
  current: Fiber,
  pendingProps: unknown,
): Fiber => {
  let workInProgress = current.alternate;

  if (workInProgress === null) {
    // First render - create new fiber
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    // Link them together
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // Update - reuse existing alternate
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;

    // Reset effect flags
    workInProgress.flags = RectifyFiberFlags.None;
  }

  // Copy other fields from current
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;

  return workInProgress;
};

const createFiberFromRectifyNode = (node: RectifyNode): Fiber | null => {
  if (isRectifyElement(node)) {
    const type = node.type;
    const tag = isString(type) ? HostComponent : FunctionComponent;
    const fiber = createFiber(tag, node.props, node.key);
    fiber.type = type;
    return fiber;
  }

  if (isText(node)) {
    const fiber = createFiber(HostText, node, null);
    return fiber;
  }

  if (isIterable(node)) {
    let firstFiber: Fiber | null = null;
    let previousFiber: Fiber | null = null;
    let index = 0;
    for (const childNode of node) {
      const nodeFiber = createFiberFromRectifyNode(childNode);
      if (!nodeFiber) {
        continue;
      }
      nodeFiber.index = index++;
      if (!firstFiber) {
        firstFiber = nodeFiber;
      } else if (previousFiber) {
        previousFiber.sibling = nodeFiber;
      }
      previousFiber = nodeFiber;
    }
    return firstFiber;
  }

  return null;
};

export { createFiber, createFiberWorkInProgress, createFiberFromRectifyNode };
