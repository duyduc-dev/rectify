import { RectifyFunctionComponent } from "@rectify/core/RectifyTypes";
import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import {
  setCurrentlyRenderingFiber,
  setHookIndex,
} from "./RectifyHookRenderingFiber";

const prepareUseHooks = (fiber: RectifyFiber) => {
  setCurrentlyRenderingFiber(fiber);
  setHookIndex(0);
};

const finishUsingHooks = () => {
  setCurrentlyRenderingFiber(null);
};

const withHooks = (
  fiber: RectifyFiber,
  Component: RectifyFunctionComponent,
  pendingProps: unknown,
) => {
  prepareUseHooks(fiber);
  const children = Component(pendingProps);
  finishUsingHooks();
  return children;
};

export { withHooks };
