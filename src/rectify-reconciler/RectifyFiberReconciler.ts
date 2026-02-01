import { RectifyNode } from "@rectify/rectify/RectifyTypes";
import {
  createFiber,
  createFiberFromRectifyNode,
  createFiberWorkInProgress,
} from "./RectifyFiber";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./RectifyFiberWorkTag";
import { Fiber } from "./RectifyFiberTypes";
import { isFunction, isString } from "@rectify/shared/utilities";
import {
  addFlag,
  hasFlag,
  RectifyFiberFlags,
  removeFlag,
} from "./RectifyFiberFlags";
import { setAttributes } from "@rectify/rectify-dom/binding/attributes";
import { renderWithHooks } from "@rectify/rectify-hook/RectifyHook";

const createContainer = (children: RectifyNode, container: Element) => {
  const root = createFiber(HostRoot, { children }, null);
  root.stateNode = container;
  return root;
};

const updateContainer = (root: Fiber, isBatchUpdate = false) => {
  const workInProgress = createFiberWorkInProgress(root, root.pendingProps);
  syncFiber(workInProgress);
  updateFlagsFiber(workInProgress);
  commitFiberWorkInProgress(workInProgress);
};

const syncFiber = (workInProgressFiber: Fiber) => {
  let workInProgress: Fiber | null = workInProgressFiber;

  while (workInProgress) {
    const firstChild = syncFiberChildren(workInProgress);
    workInProgress.child = firstChild;

    if (firstChild) {
      workInProgress = firstChild;
      continue;
    }

    while (workInProgress && !workInProgress.sibling) {
      workInProgress = workInProgress.return;
    }

    if (workInProgress) {
      workInProgress = workInProgress.sibling;
    }
  }
};

const syncFiberChildren = (parentWorkInProgress: Fiber): Fiber | null => {
  const currentFiber = parentWorkInProgress.alternate;

  const firstChild = beginWorkOnFiber(currentFiber, parentWorkInProgress);

  let node = firstChild;
  while (node) {
    node.return = parentWorkInProgress;
    node = node.sibling;
  }

  return firstChild;
};

const beginWorkOnFiber = (
  currentFiber: Fiber | null,
  fiberWorkInProgress: Fiber,
): Fiber | null => {
  const tag = fiberWorkInProgress.tag;
  switch (tag) {
    case HostRoot:
      return workOnChildHostRootFiber(currentFiber, fiberWorkInProgress);
    case FunctionComponent:
      return workOnChildFunctionComponentFiber(
        currentFiber,
        fiberWorkInProgress,
      );
    case HostComponent:
      return workOnChildHostComponentFiber(currentFiber, fiberWorkInProgress);
    default:
      return null;
  }
};

const workOnChildHostRootFiber = (
  currentFiber: Fiber | null,
  fiberWorkInProgress: Fiber,
): Fiber | null => {
  const nextChildren = fiberWorkInProgress.pendingProps?.children;
  const childFiber = createFiberFromRectifyNode(nextChildren);
  return childFiber;
};

const workOnChildFunctionComponentFiber = (
  currentFiber: Fiber | null,
  fiberWorkInProgress: Fiber,
): Fiber | null => {
  const currentFiberFuncComp = fiberWorkInProgress.alternate;

  if (!currentFiberFuncComp) {
    const Component = fiberWorkInProgress.type;
    if (!isFunction(Component)) return null;

    const nextChildren = renderWithHooks(
      fiberWorkInProgress,
      Component,
      fiberWorkInProgress.pendingProps,
    );
    const childFiber = createFiberFromRectifyNode(nextChildren);
    return childFiber;
  }

  return null;
};

const workOnChildHostComponentFiber = (
  currentFiber: Fiber | null,
  fiberWorkInProgress: Fiber,
): Fiber | null => {
  const currentFiberHostComponent = fiberWorkInProgress.alternate;

  if (!currentFiberHostComponent) {
    const nextChildren = fiberWorkInProgress.pendingProps?.children;
    const childFiber = createFiberFromRectifyNode(nextChildren);
    return childFiber;
  }

  return null;
};

const updateFlagsFiber = (fiberWorkInProgress: Fiber) => {
  let child = fiberWorkInProgress.child;
  while (child) {
    updateFlagsFiber(child);
    child = child.sibling;
  }

  const tag = fiberWorkInProgress.tag;

  switch (tag) {
    case HostText:
      return updateFlagsFiberHostText(fiberWorkInProgress);
    case HostComponent:
      return updateFlagsFiberHostComponent(fiberWorkInProgress);
  }
};

const updateFlagsFiberHostText = (fiberWorkInProgress: Fiber) => {
  const nextProps = fiberWorkInProgress.pendingProps;
  const textContent = String(nextProps);
  const textNode = document.createTextNode(textContent);
  fiberWorkInProgress.stateNode = textNode;
  fiberWorkInProgress.flags = addFlag(
    fiberWorkInProgress.flags,
    RectifyFiberFlags.Placement,
  );
};

const updateFlagsFiberHostComponent = (fiberWorkInProgress: Fiber) => {
  const type = fiberWorkInProgress.type;
  if (!isString(type)) return;
  const element = document.createElement(type);
  setAttributes(element, fiberWorkInProgress.pendingProps);
  fiberWorkInProgress.stateNode = element;
  fiberWorkInProgress.flags = addFlag(
    fiberWorkInProgress.flags,
    RectifyFiberFlags.Placement,
  );
};

const commitFiberWorkInProgress = (fiberWorkInProgress: Fiber) => {
  let child = fiberWorkInProgress.child;
  while (child) {
    commitFiberWorkInProgress(child);
    child = child.sibling;
  }

  const flags = fiberWorkInProgress.flags;

  if (hasFlag(flags, RectifyFiberFlags.Placement)) {
    const parentHost = getParentHost(fiberWorkInProgress);
    if (parentHost) {
      const parentNode = parentHost.stateNode;
      if (parentNode instanceof Element) {
        if (
          fiberWorkInProgress.tag === HostComponent ||
          fiberWorkInProgress.tag === HostText
        ) {
          parentNode.appendChild(fiberWorkInProgress.stateNode as Node);
        }

        fiberWorkInProgress.flags = removeFlag(
          fiberWorkInProgress.flags,
          RectifyFiberFlags.Placement,
        );
      }
    }
  }
};

const getParentHost = (fiber: Fiber): Fiber | null => {
  let parent = fiber.return;
  while (parent) {
    const tag = parent.tag;
    if (tag === HostComponent || tag === HostRoot) {
      return parent;
    }
    parent = parent.return;
  }
  return null;
};

const getHostRoot = (fiber: Fiber): Fiber => {
  let node: Fiber = fiber;
  while (node.return) {
    if (node.tag === HostRoot) {
      return node;
    }
    node = node.return;
  }
  return node;
};

const batchUpdate = (fiber: Fiber, callback?: () => void) => {
  updateContainer(getHostRoot(fiber), true);
  if (callback) {
    callback();
  }
};

export { createContainer, updateContainer, batchUpdate };
