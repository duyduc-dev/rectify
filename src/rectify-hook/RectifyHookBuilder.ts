import { Fiber } from "@rectify/rectify-fiber/RectifyFiberTypes";

type InstanceHookBuilder = {
  currentlyRenderingFiber: Fiber | null;
  fiberHookIndex: number;
  scheduleUpdateOnFiber: (fiber: Fiber) => void;
};

export const createRectifyHookBuilder = () => {
  const instance: InstanceHookBuilder = {
    currentlyRenderingFiber: null,
    fiberHookIndex: 0,
    scheduleUpdateOnFiber: () => {
      console.warn("Schedule hook unimplemented");
    },
  };

  const setCurrentlyRenderingFiber = (fiber: Fiber | null) => {
    instance.currentlyRenderingFiber = fiber;
  };

  const getCurrentlyRenderingFiber = () => {
    return instance.currentlyRenderingFiber;
  };

  const setFiberHookIndex = (num: number) => {
    instance.fiberHookIndex = num;
  };

  const getFiberHookIndex = () => {
    return instance.fiberHookIndex;
  };

  const setScheduleUpdateOnFiber = (updater: (fiber: Fiber) => void) => {
    instance.scheduleUpdateOnFiber = updater;
  };

  const scheduleUpdateOnFiber = (fiber: Fiber) => {
    instance.scheduleUpdateOnFiber(fiber);
  };

  return {
    setCurrentlyRenderingFiber,
    getCurrentlyRenderingFiber,
    setFiberHookIndex,
    getFiberHookIndex,
    setScheduleUpdateOnFiber,
    scheduleUpdateOnFiber,
  };
};
