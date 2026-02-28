import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { RectifyFiber } from "./RectifyFiberTypes";

const addFlagToFiber = (fiber: RectifyFiber, flag: RectifyFiberFlags): void => {
  if (hasFlagOnFiber(fiber, flag)) return;
  fiber.flags |= flag;
};

const removeFlagFromFiber = (
  fiber: RectifyFiber | null,
  flag: RectifyFiberFlags,
): void => {
  if (!hasFlagOnFiber(fiber, flag)) return;
  fiber!.flags &= ~flag;
};

const hasFlagOnFiber = (
  fiber: RectifyFiber | null,
  flag: RectifyFiberFlags,
): boolean => {
  if (!fiber) return false;
  return (fiber.flags & flag) !== 0;
};

export { addFlagToFiber, removeFlagFromFiber, hasFlagOnFiber };
