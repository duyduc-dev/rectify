import { RectifyNode } from "@rectify/core";
import {
  createDomFromRectifyElement,
  createFiber,
  createFiberFromRectifyElement,
  createWorkInProgress,
} from "./RectifyFiber";
import { RectifyFiber } from "./RectifyFiberTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import {
  getContainerDom,
  setContainerDom,
  setCurrentFiberRoot,
  setScheduledNode,
} from "./RectifyCurrentFiber";
import { isFunction, toArray } from "@rectify/shared/utilities";
import { RectifyElementType, RectifyKey } from "@rectify/core/RectifyTypes";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { isValidRectifyElement } from "@rectify/core/RectifyCoreService";
import { updateDomProps } from "@rectify/rectify-binding/events/RectifyEvents";
import { withHooks } from "@rectify/rectify-hook/RectifyHook";
import {
  addFlagToFiber,
  hasFLagOnFiber,
  removeFlagFromFiber,
} from "./RectifyFiberFlagsService";
import { RECTIFY_ELEMENT_TYPE } from "@rectify/core/RectifyElementConstants";

/**
 * Create a Fiber host root
 * @param container
 * @returns
 */
const createContainer = (container: Element) => {
  const fiber = createFiber(RectifyFiberWorkTag.HostRoot);
  fiber.stateNode = container;
  setContainerDom(container);
  setCurrentFiberRoot(fiber);
  return fiber;
};

/**
 * Update children on fiber
 * @param children
 * @param fiber
 */
const updateContainer = (
  children: RectifyNode,
  fiber: RectifyFiber,
  isBatchUpdate?: boolean,
) => {
  setScheduledNode(children);
  const wipRoot = createWorkInProgress(
    fiber,
    Object.assign({}, fiber.pendingProps, { children }),
  );
  if (!isBatchUpdate) {
    wipRoot.stateNode = getContainerDom();
  }

  const finished = renderRoot(wipRoot);
  setCurrentFiberRoot(finished);
};

const renderRoot = (wipRoot: RectifyFiber): RectifyFiber | null => {
  // Render phase (sync DFS)
  let next: RectifyFiber | null = wipRoot;
  while (next) next = performUnitOfWork(next);

  // Commit phase
  commitWork(wipRoot);

  return wipRoot;
};

const performUnitOfWork = (wip: RectifyFiber): RectifyFiber | null => {
  const workTag = wip.workTag;

  switch (workTag) {
    case RectifyFiberWorkTag.FunctionComponent:
      {
        const Component = wip.type;
        if (!isFunction(Component)) break;
        const nextChildren = withHooks(wip, Component, wip.pendingProps);
        reconcileChildren(wip, nextChildren);
      }
      break;
    case RectifyFiberWorkTag.HostComponent:
      {
        const nextChildren = (wip.pendingProps as any)?.children;
        reconcileChildren(wip, nextChildren);
      }
      break;
    case RectifyFiberWorkTag.HostRoot:
      {
        const nextChildren = (wip.pendingProps as any)?.children;
        reconcileChildren(wip, nextChildren);
      }
      break;
  }

  if (wip.child) return wip.child;
  let node: RectifyFiber | null = wip;
  while (node) {
    if (node.sibling) return node.sibling;
    node = node.return;
  }
  return null;
};

const buildKeyOnFiber = (
  key: RectifyKey = "",
  type: RectifyElementType = "",
) => {
  return `${key}__${type}__key`;
};

const getParentDom = (fiber: RectifyFiber): Node => {
  if (fiber.workTag === RectifyFiberWorkTag.HostRoot)
    return fiber.stateNode as Node;

  let p = fiber.return;
  while (p) {
    if (
      p.workTag === RectifyFiberWorkTag.HostComponent ||
      p.workTag === RectifyFiberWorkTag.HostRoot
    ) {
      return p.stateNode as Node;
    }
    p = p.return;
  }

  throw new Error("No parent DOM found.");
};

const getParentFiber = (fiber: RectifyFiber): RectifyFiber => {
  if (fiber.workTag === RectifyFiberWorkTag.HostRoot) return fiber;

  let p = fiber.return;
  while (p) {
    switch (p.workTag) {
      case RectifyFiberWorkTag.HostComponent:
      case RectifyFiberWorkTag.HostRoot:
        return p;
    }
    p = p.return;
  }

  throw new Error("No parent Fiber found.");
};

const reconcileChildren = (wip: RectifyFiber, nextChildren: RectifyNode) => {
  const currentFiber = wip.alternate;
  const currentFiberChildHead = currentFiber?.child;

  let index = 0;
  let oldCurrentFiberChild = currentFiberChildHead;
  let prevSibling: RectifyFiber | null = null;

  toArray(nextChildren).forEach((child) => {
    if (!isValidRectifyElement(child)) return;
    const childKey = child.key ?? null;
    const childType = child.type;

    let newFiber: RectifyFiber | null = null;

    if (oldCurrentFiberChild) {
      newFiber = createWorkInProgress(oldCurrentFiberChild, child.props);
      addFlagToFiber(newFiber, RectifyFiberFlags.Update);
    } else {
      newFiber = createFiberFromRectifyElement(child);
      addFlagToFiber(newFiber, RectifyFiberFlags.Placement);
    }

    newFiber.return = wip;
    newFiber.index = index++;
    newFiber.type = childType;
    newFiber.key = childKey;

    oldCurrentFiberChild = oldCurrentFiberChild?.sibling;

    // Link sibling fiber
    if (!prevSibling) wip.child = newFiber;
    else prevSibling.sibling = newFiber;
    prevSibling = newFiber;
  });
};

const commitWork = (wip: RectifyFiber) => {
  switch (wip.workTag) {
    case RectifyFiberWorkTag.HostComponent:
      commitHostComponent(wip);
      break;
    case RectifyFiberWorkTag.HostText:
      commitHostText(wip);
    default:
      break;
  }

  wip.memoizedProps = wip.pendingProps;

  let child = wip.child;
  while (child) {
    commitWork(child);
    child = child.sibling;
  }
};

const commitHostComponent = (wip: RectifyFiber) => {
  console.log(">> wip", wip);

  if (!wip.stateNode) {
    const dom = createDomFromRectifyElement({
      type: wip.type,
      props: wip.pendingProps,
      key: wip.key,
      __type__: RECTIFY_ELEMENT_TYPE,
    });
    wip.stateNode = dom;
    updateDomProps(dom, {}, wip.pendingProps);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Placement)) {
    const parentDom = getParentDom(wip);
    parentDom.appendChild(wip.stateNode);
    removeFlagFromFiber(wip, RectifyFiberFlags.Placement);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Update)) {
    console.log("Update hots component");
    updateDomProps(wip.stateNode, wip.memoizedProps, wip.pendingProps);
    removeFlagFromFiber(wip, RectifyFiberFlags.Update);
  }
};

const commitHostText = (wip: RectifyFiber) => {
  if (!wip.stateNode) {
    const textNode = document.createTextNode(String(wip.pendingProps ?? ""));
    wip.stateNode = textNode;
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Placement)) {
    const parentDom = getParentDom(wip);

    parentDom.appendChild(wip.stateNode);
    removeFlagFromFiber(wip, RectifyFiberFlags.Placement);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Update)) {
    console.log("Update hots text");
    (wip.stateNode as Text).nodeValue = String(wip.pendingProps ?? "");
    removeFlagFromFiber(wip, RectifyFiberFlags.Update);
  }
};

const scheduleUpdateOnFiber = (fiber: RectifyFiber) => {
  updateContainer((fiber?.pendingProps as any)?.children, fiber, true);
};

export { createContainer, updateContainer, scheduleUpdateOnFiber };
