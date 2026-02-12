import { RectifyFiberFlags } from "./RectifyFiberFlags";
import { RectifyFiber } from "./RectifyFiberTypes";

const addFlagToFiber = (fiber: RectifyFiber, flag: RectifyFiberFlags): void => {
  fiber.flags |= flag;
};

const removeFlagFromFiber = (
  fiber: RectifyFiber,
  flag: RectifyFiberFlags,
): void => {
  fiber.flags &= ~flag;
};

const hasFLagOnFiber = (
  fiber: RectifyFiber,
  flag: RectifyFiberFlags,
): boolean => {
  return (fiber.flags & flag) !== 0;
};

export { addFlagToFiber, removeFlagFromFiber, hasFLagOnFiber };
