import { Fiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import { JSXElementFunctional } from "@rectify/rectify/RectifyTypes";
import { setCurrentFiberRendering } from "./RectifyHookCurrentFiber";

const renderWithHooks = (
  workInProgress: Fiber,
  Component: JSXElementFunctional<any>,
  props: any,
) => {
  setCurrentFiberRendering(workInProgress);
  const child = Component(props);
  setCurrentFiberRendering(null);
  return child;
};

export { renderWithHooks };
