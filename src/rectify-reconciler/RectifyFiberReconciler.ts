import { RectifyNode } from "@rectify/core";
import { createFiber, createWorkInProgress } from "./RectifyFiber";
import { RectifyFiber } from "./RectifyFiberTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";
import {
  getContainerDom,
  setContainerDom,
  setCurrentFiberRoot,
  setScheduledNode,
} from "./RectifyCurrentFiber";
import {
  isFunction,
  isIterable,
  isPlainObject,
  toArray,
} from "@rectify/shared/utilities";
import { RectifyElementType, RectifyKey } from "@rectify/core/RectifyTypes";
import { RectifyFiberFlags } from "./RectifyFiberFlags";

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
const updateContainer = (children: RectifyNode, fiber: RectifyFiber) => {
  setScheduledNode(children);
  const wipRoot = createWorkInProgress(fiber, { children });
  wipRoot.stateNode = getContainerDom();

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
        const nextChildren = Component(wip.pendingProps);
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
  return `${key ?? ""}__${type}__key`;
};

const reconcileChildren = (wip: RectifyFiber, nextChildren: RectifyNode) => {
  let oldFiber = wip.alternate?.child ?? null;
  let prevSibling: RectifyFiber | null = null;

  // keyed map for old siblings (simple impl)
  const oldMap = new Map<string, RectifyFiber>();
  while (oldFiber) {
    const key = buildKeyOnFiber(oldFiber.key, oldFiber.type);
    oldMap.set(key, oldFiber);
    oldFiber = oldFiber.sibling;
  }

  let index = 0;

  for (const childRectifyNode of toArray(nextChildren)) {
    const childKey =
      isPlainObject(childRectifyNode) && !isIterable(childRectifyNode)
        ? childRectifyNode?.key
        : "";
    const childType =
      isPlainObject(childRectifyNode) && !isIterable(childRectifyNode)
        ? childRectifyNode?.type
        : null;
    const key = buildKeyOnFiber(childKey, childType ?? "");
    const matchedOld = oldMap.get(key) ?? null;

    let newFiber: RectifyFiber;
    if (matchedOld) {
      newFiber = createWorkInProgress(
        matchedOld,
        isPlainObject(childRectifyNode) && !isIterable(childRectifyNode)
          ? childRectifyNode.props
          : childRectifyNode,
      );
      newFiber.type = childType;
      // Decide update flag by shallow props compare
      if (matchedOld.memoizedProps !== newFiber.pendingProps)
        newFiber.flags |= RectifyFiberFlags.Update;
      oldMap.delete(key);
    } else {
      // newFiber = createFiberFromVNode(childVNode);
      // newFiber.pendingProps = (childVNode as any).props;
      // newFiber.flags |= RectifyFiberFlags.Placement;
    }
  }
};

const commitWork = (wipRoot: RectifyFiber) => {};

export { createContainer, updateContainer };
