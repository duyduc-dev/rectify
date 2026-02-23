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
  hasRenderingScheduled,
  setContainerDom,
  setCurrentFiberRoot,
  setRenderingScheduled,
  setScheduledNode,
} from "./RectifyCurrentFiber";
import { assignObject, isFunction, toArray } from "@rectify/shared/utilities";
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
import { flushPassiveEffects } from "@rectify/rectify-hook/RectifyHookUseEffect";
import { isEffectHook } from "@rectify/rectify-hook/RectifyHookService";
import { isHost, walkFiberTree } from "./RectifyFiberReconcilerService";

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

  flushPassiveEffects(wipRoot);

  return wipRoot;
};

const performUnitOfWork = (wip: RectifyFiber): RectifyFiber | null => {
  const workTag = wip.workTag;

  switch (workTag) {
    case RectifyFiberWorkTag.FunctionComponent:
      {
        const Component = wip.type;
        if (!isFunction(Component)) break;
        const nextProps = assignObject(
          {},
          Component.defaultProps,
          wip.pendingProps,
        );
        const NewComponent = withHooks(wip, Component);
        const nextChildren = NewComponent(nextProps);
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
  uniqueId = "",
) => {
  return `__${key ?? ""}__${type ?? ""}__key` + uniqueId;
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

function getHostSibling(fiber: RectifyFiber): Node | null {
  let sibling = fiber.sibling;

  while (sibling) {
    if (isHost(sibling)) {
      return sibling.stateNode;
    }
    sibling = sibling.sibling;
  }

  return null;
}

const reconcileChildren = (wip: RectifyFiber, nextChildren: RectifyNode) => {
  const currentFiber = wip.alternate;
  const currentFiberChildHead = currentFiber?.child;
  const deletionFiber: RectifyFiber[] = [];

  let index = 0;
  let oldCurrentFiberChild = currentFiberChildHead;
  let prevSibling: RectifyFiber | null = null;

  const existingChildren = new Map<string, RectifyFiber>();
  while (oldCurrentFiberChild) {
    const key = buildKeyOnFiber(
      oldCurrentFiberChild.key,
      oldCurrentFiberChild.type,
      String(oldCurrentFiberChild.index),
    );
    existingChildren.set(key, oldCurrentFiberChild);
    oldCurrentFiberChild = oldCurrentFiberChild.sibling;
  }

  toArray(nextChildren).forEach((child) => {
    if (!isValidRectifyElement(child)) return;

    const childKey = child.key ?? null;
    const childType = child.type;

    const lookupKey = buildKeyOnFiber(
      childKey,
      childType,
      String(child.index),
    );
    const matched = existingChildren.get(lookupKey);

    let newFiber: RectifyFiber | null = null;

    const isSame =
      matched && !hasFLagOnFiber(matched, RectifyFiberFlags.Deletion);

    if (isSame) {
      newFiber = createWorkInProgress(matched, child.props);
      addFlagToFiber(newFiber, RectifyFiberFlags.Update);
      existingChildren.delete(lookupKey);
    } else {
      if (matched) {
        addFlagToFiber(matched, RectifyFiberFlags.Deletion);
        existingChildren.delete(lookupKey);
        deletionFiber.push(matched);
      }
      newFiber = createFiberFromRectifyElement(child);
      addFlagToFiber(newFiber, RectifyFiberFlags.Placement);
    }

    newFiber.return = wip;
    newFiber.index = index++;
    newFiber.type = childType;
    newFiber.key = childKey;

    // Link sibling fiber
    if (!prevSibling) wip.child = newFiber;
    else prevSibling.sibling = newFiber;
    prevSibling = newFiber;
  });

  for (const [, existing] of existingChildren) {
    deletionFiber.push(existing);
    addFlagToFiber(existing, RectifyFiberFlags.Deletion);
  }

  wip.deletions = deletionFiber;
};

const commitWork = (wip: RectifyFiber) => {
  walkFiberTree(wip, (wipVisitor) => {
    if (wipVisitor.deletions?.length) {
      wipVisitor.deletions.forEach(commitDeletion);
      wipVisitor.deletions = [];
    }

    switch (wipVisitor.workTag) {
      case RectifyFiberWorkTag.HostComponent:
        commitHostComponent(wipVisitor);
        break;
      case RectifyFiberWorkTag.HostText:
        commitHostText(wipVisitor);
        break;
      default:
        break;
    }

    wipVisitor.memoizedProps = wipVisitor.pendingProps;
  });
};

const commitHostComponent = (wip: RectifyFiber) => {
  if (!wip.stateNode) {
    const dom = createDomFromRectifyElement({
      type: wip.type,
      props: wip.pendingProps,
      key: wip.key,
      index: wip.index,
      __type__: RECTIFY_ELEMENT_TYPE,
    });
    wip.stateNode = dom;
    updateDomProps(dom, {}, wip.pendingProps);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Placement)) {
    const sibling = getHostSibling(wip);
    const parentDom = getParentDom(wip);

    if (sibling) {
      parentDom.insertBefore(wip.stateNode, sibling);
    } else {
      parentDom.appendChild(wip.stateNode);
    }
    removeFlagFromFiber(wip, RectifyFiberFlags.Placement);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Update)) {
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
    const sibling = getHostSibling(wip);
    const parentDom = getParentDom(wip);

    if (sibling) {
      parentDom.insertBefore(wip.stateNode, sibling);
    } else {
      parentDom.appendChild(wip.stateNode);
    }
    removeFlagFromFiber(wip, RectifyFiberFlags.Placement);
  }

  if (hasFLagOnFiber(wip, RectifyFiberFlags.Update)) {
    const current = wip.alternate;
    if (current?.pendingProps !== wip.pendingProps) {
      (wip.stateNode as Text).nodeValue = String(wip.pendingProps ?? "");
    }
    removeFlagFromFiber(wip, RectifyFiberFlags.Update);
  }
};

const commitDeletion = (fiber: RectifyFiber) => {
  // Host parent OUTSIDE the deleted subtree
  const parentDom = getParentDom(fiber);

  // 1) cleanup effects throughout subtree
  commitPassiveUnmountEffects(fiber);

  // 2) remove host nodes (top-most only) from parentDom
  removeHostNodesFromParent(fiber, parentDom);
};

const commitPassiveUnmountEffects = (fiber: RectifyFiber) => {
  walkFiberTree(fiber, (f) => {
    if (f.hooks) {
      for (const hook of f.hooks) {
        if (isEffectHook(hook) && hook.cleanup) hook.cleanup();
      }
    }
  });
};

const removeHostNodesFromParent = (fiber: RectifyFiber, parentDom: Node) => {
  walkFiberTree(fiber, (f) => {
    // If this fiber is a host node, remove it ONCE and stop.
    // Descendants are removed automatically by the DOM.
    if (isHost(f)) {
      if (f.stateNode && f.stateNode.parentNode === parentDom) {
        parentDom.removeChild(f.stateNode);
      } else if (f.stateNode && f.stateNode.parentNode) {
        // safer fallback: remove from actual parent
        fiber.stateNode.parentNode.removeChild(f.stateNode);
      }
    }
  });
};

const scheduleUpdateOnFiber = (fiber: RectifyFiber) => {
  const scheduledRoot = fiber;
  if (hasRenderingScheduled()) return;

  setRenderingScheduled(true);

  queueMicrotask(() => {
    updateContainer(
      (fiber?.memoizedProps as any)?.children,
      scheduledRoot,
      true,
    );
    setRenderingScheduled(false);
  });
};

export { createContainer, updateContainer, scheduleUpdateOnFiber };
