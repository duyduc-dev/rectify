import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";

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

export const setHookIndex = (index: number) => {
  instance.hookIndex = index;
};
export const getHookIndex = () => instance.hookIndex;
