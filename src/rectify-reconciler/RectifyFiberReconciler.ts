import { RectifyNode } from "@rectify/core";
import { createFiber, createWorkInProgress } from "./RectifyFiber";
import { RectifyFiber } from "./RectifyFiberTypes";
import { RectifyFiberWorkTag } from "./RectifyFiberWorkTag";

/**
 * Create a Fiber host root
 * @param container 
 * @returns 
 */
const createContainer = (container: Element) => {
  const fiber = createFiber(RectifyFiberWorkTag.HostRoot);
  fiber.stateNode = container;

  return fiber;
};

/**
 * Update children on fiber
 * @param children 
 * @param fiber 
 */
const updateContainer = (children: RectifyNode, fiber: RectifyFiber) => {
  const wipRoot = createWorkInProgress(fiber, { children });
};

export { createContainer, updateContainer };
