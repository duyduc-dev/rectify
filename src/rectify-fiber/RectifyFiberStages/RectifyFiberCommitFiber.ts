import { isText } from "@rectify/shared/utilities";
import { Update, Placement } from "../RectifyFiberFlags";
import { HostComponent, HostText } from "../RectifyFiberTags";
import { Fiber } from "../RectifyFiberTypes";
import { getHostParentFiber } from "../RectifyFiberUtilities";

export const commitFiberStage = (fiber: Fiber) => {
  let child = fiber.firstChild;
  while (child) {
    commitFiberStage(child);
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

const commitFiberUpdate = (fiberBuilder: Fiber) => {
  console.log("commitFiberUpdate", fiberBuilder.type, { fiberBuilder });
};

const commitFiberPlacement = (fiber: Fiber) => {
  if (fiber.tag !== HostComponent && fiber.tag !== HostText) return;

  const hostParent = getHostParentFiber(fiber);
  if (!hostParent) return;

  const parent = hostParent.stateNode;
  if (parent && fiber.stateNode) {
    parent.appendChild(fiber.stateNode);
  }
};
