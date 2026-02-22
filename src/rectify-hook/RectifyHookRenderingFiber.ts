import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import { isFunction } from "@rectify/shared/utilities";

type Instance = {
  currentlyRenderingFiber: RectifyFiber | null;
  hookIndex: number;
};

const instance: Instance = {
  currentlyRenderingFiber: null,
  hookIndex: 0,
};

export const setCurrentlyRenderingFiber = (fiber: RectifyFiber | null) => {
  instance.currentlyRenderingFiber = fiber;
};
export const getCurrentlyRenderingFiber = () =>
  instance.currentlyRenderingFiber;

export const setHookIndex = (index: number | ((prev: number) => number)) => {
  instance.hookIndex = isFunction(index) ? index(instance.hookIndex) : index;
};
export const getHookIndex = () => instance.hookIndex;
export const nextHookIndex = () => {
  setHookIndex((prev) => prev + 1);
};
