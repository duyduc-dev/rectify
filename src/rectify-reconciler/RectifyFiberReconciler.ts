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
  getCurrentFiberRoot,
  getScheduledNode,
  setContainerDom,
  setCurrentFiberRoot,
  setScheduledNode,
} from "./RectifyCurrentFiber";
import { isFunction, isTextNode, toArray } from "@rectify/shared/utilities";
import { RectifyElementType, RectifyKey } from "@rectify/core/RectifyTypes";
import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { isValidRectifyElement } from "@rectify/core/RectifyCoreService";
import { updateDomProps } from "@rectify/rectify-binding/events/RectifyEvents";
import { withHooks } from "@rectify/rectify-hook/RectifyHook";

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
  return `${key ?? ""}__${type}__key`;
};

const reconcileChildren = (wip: RectifyFiber, nextChildren: RectifyNode) => {
  // old list head (for positional matching)
  let oldFiberHead = wip.alternate?.child ?? null;
  let oldFiber = oldFiberHead;

  let prevSibling: RectifyFiber | null = null;

  // keyed map (ONLY keyed old fibers)
  const keyedOld = new Map<string, RectifyFiber>();
  while (oldFiber) {
    if (oldFiber.key != null) {
      keyedOld.set(buildKeyOnFiber(oldFiber.key, oldFiber.type), oldFiber);
    }
    oldFiber = oldFiber.sibling;
  }

  // reset oldFiber pointer back for positional matching
  oldFiber = oldFiberHead;

  let index = 0;

  for (const child of toArray(nextChildren)) {
    let newFiber: RectifyFiber | null = null;

    // -------------------------
    // 1) TEXT NODE (positional)
    // -------------------------
    if (isValidRectifyElement(child) && isTextNode(child)) {
      const textContent = String(child.props);

      let matchedOld: RectifyFiber | null = null;
      if (
        oldFiber &&
        oldFiber.key == null &&
        oldFiber.workTag === RectifyFiberWorkTag.HostText
      ) {
        matchedOld = oldFiber;
      }

      if (matchedOld) {
        newFiber = createWorkInProgress(matchedOld, textContent);
        if (matchedOld.memoizedProps !== textContent) {
          newFiber.flags |= RectifyFiberFlags.Update;
        }
      } else {
        newFiber = createFiber(RectifyFiberWorkTag.HostText);
        newFiber.pendingProps = textContent;
        newFiber.flags |= RectifyFiberFlags.Placement;
      }

      newFiber.type = "TEXT";
      newFiber.key = null;

      // advance positional oldFiber if it was unkeyed (whether matched or not)
      if (oldFiber && oldFiber.key == null) oldFiber = oldFiber.sibling;
    }

    // -------------------------
    // 2) ELEMENT NODE
    // -------------------------
    else if (isValidRectifyElement(child)) {
      const childKey = child.key ?? null;
      const childType = child.type;

      // 2a) keyed element → keyed match
      if (childKey != null) {
        const mapKey = buildKeyOnFiber(childKey, childType ?? "");
        const matchedOld = keyedOld.get(mapKey) ?? null;

        if (matchedOld) {
          newFiber = createWorkInProgress(matchedOld, child.props);
          newFiber.type = childType;

          if (matchedOld.memoizedProps !== child.props) {
            newFiber.flags |= RectifyFiberFlags.Update;
          }

          keyedOld.delete(mapKey);
        } else {
          newFiber = createFiberFromRectifyElement(child);
          newFiber.pendingProps = child.props;
          newFiber.type = childType;
          newFiber.key = childKey;
          newFiber.flags |= RectifyFiberFlags.Placement;
        }
      }

      // 2b) unkeyed element → positional match
      else {
        let matchedOld: RectifyFiber | null = null;
        if (oldFiber && oldFiber.key == null && oldFiber.type === childType) {
          matchedOld = oldFiber;
        }

        if (matchedOld) {
          newFiber = createWorkInProgress(matchedOld, child.props);
          newFiber.type = childType;

          if (matchedOld.memoizedProps !== child.props) {
            newFiber.flags |= RectifyFiberFlags.Update;
          }
        } else {
          newFiber = createFiberFromRectifyElement(child);
          newFiber.pendingProps = child.props;
          newFiber.type = childType;
          newFiber.key = null;
          newFiber.flags |= RectifyFiberFlags.Placement;
        }

        if (oldFiber && oldFiber.key == null) oldFiber = oldFiber.sibling;
      }
    }

    // ignore booleans/null/iterables etc (should be normalized earlier)
    else {
      continue;
    }

    // link into wip child list
    newFiber.return = wip;
    newFiber.index = index++;

    if (!prevSibling) wip.child = newFiber;
    else prevSibling.sibling = newFiber;

    prevSibling = newFiber;
  }

  // -------------------------
  // deletions: anything left
  // -------------------------

  // (A) leftover keyed old fibers
  if (keyedOld.size) {
    wip.deletions = wip.deletions ?? [];
    for (const [, f] of keyedOld) {
      f.flags |= RectifyFiberFlags.Deletion;
      wip.deletions.push(f);
    }
  }

  // (B) leftover positional old fibers (unkeyed chain not consumed)
  while (oldFiber) {
    if (oldFiber.key == null) {
      wip.deletions = wip.deletions ?? [];
      oldFiber.flags |= RectifyFiberFlags.Deletion;
      wip.deletions.push(oldFiber);
    }
    oldFiber = oldFiber.sibling;
  }
};

function safelyRemoveChild(parent: Node, child: Node) {
  // avoids NotFoundError if already moved/removed
  if (child.parentNode === parent) parent.removeChild(child);
}

function commitDeletion(fiber: RectifyFiber) {
  // If this is a host node, remove it from *its* host parent
  if (isHostFiber(fiber)) {
    const parentDom = getParentDom(fiber);
    safelyRemoveChild(parentDom, fiber.stateNode);
    return;
  }

  let child = fiber.child;
  while (child) {
    commitDeletion(child);
    child = child.sibling;
  }
}

function getParentDom(fiber: RectifyFiber): Node {
  if (fiber.workTag === RectifyFiberWorkTag.HostRoot)
    return fiber.stateNode as Node;
  let p = fiber.return;
  while (p) {
    if (p.workTag === RectifyFiberWorkTag.HostComponent)
      return p.stateNode as Node;
    if (p.workTag === RectifyFiberWorkTag.HostRoot) return p.stateNode as Node;
    p = p.return;
  }
  throw new Error("No parent DOM found.");
}

function commitWork(fiber: RectifyFiber) {
  const parentDom = getParentDom(fiber);

  // Deletions attached on parent (wip)
  const deletions = fiber.deletions;
  if (deletions && deletions.length) {
    for (const d of deletions) commitDeletion(d);
  }

  if (fiber.workTag === RectifyFiberWorkTag.HostComponent) {
    if (!fiber.stateNode) {
      fiber.stateNode = createDomFromRectifyElement({
        __type__: Symbol.for("placeholder"),
        type: fiber.type,
        key: fiber.key,
        props: fiber.pendingProps,
      });
      updateDomProps(fiber.stateNode, {}, fiber.pendingProps);
    } else if (fiber.flags & RectifyFiberFlags.Update) {
      updateDomProps(
        fiber.stateNode,
        fiber.memoizedProps ?? {},
        fiber.pendingProps ?? {},
      );
    }

    if (fiber.flags & RectifyFiberFlags.Placement) {
      if (fiber.flags & RectifyFiberFlags.Placement) {
        const before = getHostSibling(fiber);
        console.log("before", before);

        if (before) {
          parentDom.insertBefore(fiber.stateNode, before);
        } else {
          parentDom.appendChild(fiber.stateNode);
        }
      }
    }
  }

  if (fiber.workTag === RectifyFiberWorkTag.HostText) {
    if (!fiber.stateNode) {
      fiber.stateNode = document.createTextNode(
        String(fiber.pendingProps ?? ""),
      );
    } else if (fiber.flags & RectifyFiberFlags.Update) {
      if ((fiber.stateNode as Text).nodeValue !== fiber.pendingProps) {
        (fiber.stateNode as Text).nodeValue = String(fiber.pendingProps ?? "");
      }
    }

    if (fiber.flags & RectifyFiberFlags.Placement) {
      if (fiber.flags & RectifyFiberFlags.Placement) {
        const before = getHostSibling(fiber);
        if (before) {
          parentDom.insertBefore(fiber.stateNode, before);
        } else {
          parentDom.appendChild(fiber.stateNode);
        }
      }
    }
  }

  // finalize memoizedProps
  fiber.memoizedProps = fiber.pendingProps;

  // commit children
  let child = fiber.child;
  while (child) {
    commitWork(child);
    child = child.sibling;
  }
}

const scheduleUpdateOnRoot = () => {
  const currentRoot = getCurrentFiberRoot();
  const scheduleContainer = getContainerDom();

  if (!currentRoot || !scheduleContainer) return;
  updateContainer(getScheduledNode(), currentRoot);
};

function isHostFiber(fiber: RectifyFiber) {
  return (
    fiber.workTag === RectifyFiberWorkTag.HostComponent ||
    fiber.workTag === RectifyFiberWorkTag.HostText
  );
}

function getHostSibling(fiber: RectifyFiber): Node | null {
  let node = fiber.sibling;

  while (node) {
    if (isHostFiber(node) && !(node.flags & RectifyFiberFlags.Placement)) {
      return node.stateNode;
    }
    node = node.sibling;
  }

  return null;
}

export { createContainer, updateContainer, scheduleUpdateOnRoot };
