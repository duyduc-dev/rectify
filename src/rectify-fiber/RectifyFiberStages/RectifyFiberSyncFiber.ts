import { RectifyHookRenderer } from "@rectify/rectify-hook/RectifyHook";
import { isFunction, isPlainObject } from "@rectify/shared/utilities";
import { createFiberFromRectifyNode } from "../RectifyFiber";
import { Placement } from "../RectifyFiberFlags";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
} from "../RectifyFiberTags";
import { Fiber } from "../RectifyFiberTypes";

export const syncFiberStage = (fiber: Fiber) => {
  syncFiberNode(fiber);
};

const syncFiberNode = (fiber: Fiber) => {
  updateFiberChildren(fiber);

  let node = fiber.firstChild;
  while (node) {
    syncFiberNode(node);
    node = node.sibling;
  }
};

const updateFiberChildren = (fiber: Fiber) => {
  const canHaveChildren = [HostComponent, HostRoot, FunctionComponent];
  if (!canHaveChildren.includes(fiber.tag)) {
    return null;
  }
  reconcileChildren(fiber);
};

const reconcileChildren = (fiberBuilder: Fiber) => {
  const currentFiber = fiberBuilder.alternate;

  if (!currentFiber) {
    firstMountChildren(fiberBuilder);
  } else {
    updateExistingChildren(fiberBuilder);
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

const firstMountChildren = (fiberBuilder: Fiber) => {
  const nextChildren = resolveChildren(fiberBuilder);
  const newFirstChildFiber = createFiberFromRectifyNode(nextChildren);
  if (!newFirstChildFiber) return;

  fiberBuilder.firstChild = newFirstChildFiber;

  newFirstChildFiber.return = fiberBuilder;
  newFirstChildFiber.flags |= Placement;

  // loop through siblings
  let sibling = newFirstChildFiber.sibling;
  while (sibling) {
    sibling.return = fiberBuilder;
    sibling.flags |= Placement;
    sibling = sibling.sibling;
  }
};

const updateExistingChildren = (fiberBuilder: Fiber) => {
  const nextChildren = resolveChildren(fiberBuilder);
  const currentFiber = fiberBuilder.alternate!;
  const currentFirstChild = currentFiber.firstChild;

  if (!currentFirstChild) {
    firstMountChildren(fiberBuilder);
    return;
  }
  console.log("updateExistingChildren not implemented yet", {
    fiberBuilder,
    nextChildren,
    currentFirstChild,
  });

  if (isPlainObject(nextChildren)) {
  }
};
