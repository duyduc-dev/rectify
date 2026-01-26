import { HostComponent, HostRoot } from "./RectifyFiberTags";
import { Fiber } from "./RectifyFiberTypes";

export const getHostRootFiber = (fiber: Fiber) => {
  let node: Fiber | null = fiber;
  while (node && node.tag !== HostRoot) node = node.return;
  return node;
};

export const getHostParentFiber = (fiber: Fiber): Fiber | null => {
  let parent: Fiber | null = fiber.return;

  while (parent) {
    if (parent.tag === HostComponent || parent.tag === HostRoot) {
      return parent;
    }
    parent = parent?.return;
  }

  return null;
};
