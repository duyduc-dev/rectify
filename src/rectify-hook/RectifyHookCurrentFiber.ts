import { Fiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";

type RectifyHookContext = {
  CurrentFiberRendering: Fiber | null;
};

const context: RectifyHookContext = {
  CurrentFiberRendering: null,
};

const setCurrentFiberRendering = (fiber: Fiber | null) => {
  context.CurrentFiberRendering = fiber;
};

const getCurrentFiberRendering = () => {
  return context.CurrentFiberRendering;
};

export { setCurrentFiberRendering, getCurrentFiberRendering };
