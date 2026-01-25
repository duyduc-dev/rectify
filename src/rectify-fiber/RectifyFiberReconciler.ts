import { RectifyNode } from "@rectify/core";
import { createFiberRoot } from "./RectifyFiberRoot";
import { Fiber, FiberRoot } from "./RectifyFiberTypes";
import {
  createFiberFromRectifyNode,
  createRectifyFiberBuilder,
} from "./RectifyFiber";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./RectifyFiberTags";
import { isFunction, isPlainObject, isText } from "@rectify/shared/utilities";
import { Placement, Update } from "./RectifyFiberFlags";
import { setDOMProperties } from "@rectify/rectify-dom-binding/events/RectifyEventPlugin";
import {
  RectifyHookRenderer,
  setScheduleUpdateOnFiber,
} from "@rectify/rectify-hook/RectifyHook";

export const createContainer = (container: Element) => {
  const root = createFiberRoot(container);

  setScheduleUpdateOnFiber((fiber) => {
    const hostRoot = getHostRootFiber(fiber);
    if (!hostRoot) return;
    const fiberBuilder = createRectifyFiberBuilder(hostRoot, hostRoot.props);
    syncFiber(fiberBuilder);
    completeFiber(fiberBuilder);
    commitFiber(fiberBuilder);
    if (hostRoot.root) {
      hostRoot.root.current = fiberBuilder;
    }
  });
  return root;
};

export const updateContainer = (children: RectifyNode, root: FiberRoot) => {
  const current = root.current;
  const fiberBuilder = createRectifyFiberBuilder(current, { children });
  syncFiber(fiberBuilder);
  completeFiber(fiberBuilder);
  commitFiber(fiberBuilder);
  root.current = fiberBuilder;
};

const syncFiber = (fiber: Fiber) => {
  syncFiberNode(fiber);
};

const syncFiberNode = (fiber: Fiber) => {
  const child = updateFiberChildren(fiber);

  let node = child;
  while (node) {
    syncFiberNode(node);
    node = node.sibling;
  }
};

const completeFiber = (fiberBuilder: Fiber) => {
  const current = fiberBuilder.alternate;

  switch (fiberBuilder.tag) {
    case HostComponent: {
      if (current) {
        fiberBuilder.stateNode = current.stateNode;
        break;
      }
      if (!isText(fiberBuilder.type)) {
        break;
      }
      const type = fiberBuilder.type;
      const instance = document.createElement(type);
      fiberBuilder.stateNode = instance;
      setDOMProperties(instance, fiberBuilder.props);
      break;
    }
    case HostText: {
      if (current) {
        fiberBuilder.stateNode = current.stateNode;
        break;
      }
      const instance = document.createTextNode(
        String(isPlainObject(fiberBuilder.props) ? "" : fiberBuilder.props),
      );

      fiberBuilder.stateNode = instance;
      break;
    }
    case HostRoot: {
      // Root already has stateNode = container
      break;
    }
    default:
      break;
  }

  let child = fiberBuilder.firstChild;
  while (child) {
    completeFiber(child);
    child = child.sibling;
  }
};

const commitFiber = (fiber: Fiber) => {
  let child = fiber.firstChild;
  while (child) {
    commitFiber(child);
    child = child.sibling;
  }

  const flags = fiber.flags;

  if (flags & Update) {
    commitFiberUpdate(fiber);
    fiber.flags &= ~Update;
  }

  if (flags & Placement) {
    commitFiberPlacement(fiber);
    fiber.flags &= ~Placement;
  }
};

const commitFiberUpdate = (fiberBuilder: Fiber) => {};

const commitFiberPlacement = (fiber: Fiber) => {
  if (fiber.tag !== HostComponent && fiber.tag !== HostText) return;

  const hostParent = getHostParentFiber(fiber);
  if (!hostParent) return;

  const parent = hostParent.stateNode;
  if (parent && fiber.stateNode) {
    parent.appendChild(fiber.stateNode);
  }
};

const getHostParentFiber = (fiber: Fiber): Fiber | null => {
  let parent: Fiber | null = fiber.return;

  while (parent) {
    if (parent.tag === HostComponent || parent.tag === HostRoot) {
      return parent;
    }
    parent = parent?.return;
  }

  return null;
};

const getHostRootFiber = (fiber: Fiber) => {
  let node: Fiber | null = fiber;
  while (node && node.tag !== HostRoot) node = node.return;
  return node;
};

const updateFiberChildren = (fiber: Fiber): Fiber | null => {
  const canHaveChildren = [HostComponent, HostRoot, FunctionComponent];
  if (!canHaveChildren.includes(fiber.tag)) {
    return null;
  }
  reconcileChildren(fiber);
  return fiber.firstChild;
};

const reconcileChildren = (fiberBuilder: Fiber) => {
  const nextChildren = resolveChildren(fiberBuilder);
  const firstChild = createFiberFromRectifyNode(nextChildren);
  if (!firstChild) return;

  fiberBuilder.firstChild = firstChild;

  attachFiber(firstChild, fiberBuilder);

  let sibling = firstChild.sibling;
  while (sibling) {
    attachFiber(sibling, fiberBuilder);
    sibling = sibling.sibling;
  }
};

const resolveChildren = (fiberBuilder: Fiber) => {
  const Component = isFunction(fiberBuilder.type) && fiberBuilder.type;

  if (Component) {
    const props = fiberBuilder.props as Record<string, any>;
    const renderWithHooks = new RectifyHookRenderer(
      fiberBuilder,
      Component,
      props,
    );
    return renderWithHooks.render();
  }

  if (isPlainObject(fiberBuilder.props)) {
    return fiberBuilder.props.children;
  }

  // Text node
  return fiberBuilder.props;
};

const attachFiber = (fiberBuilder: Fiber, parentFiberBuilder: Fiber) => {
  fiberBuilder.return = parentFiberBuilder;

  // if existing current fiber
  if (fiberBuilder.alternate) {
    fiberBuilder.flags |= Update;
  } else {
    fiberBuilder.flags |= Placement;
  }
};
