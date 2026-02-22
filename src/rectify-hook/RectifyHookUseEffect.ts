import { RectifyFiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import {
  getCurrentlyRenderingFiber,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";
import { EffectHook, HookType } from "./RectifyHookTypes";
import { isFunction } from "@rectify/shared/utilities";

function areHookInputsEqual(
  nextDeps: any[] | undefined,
  prevDeps: any[] | undefined,
) {
  if (!prevDeps || !nextDeps) return false;
  if (prevDeps.length !== nextDeps.length) return false;

  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }

  return true;
}

function useEffect(create: () => (() => void) | void, deps?: any[]) {
  const fiber = getCurrentlyRenderingFiber();
  if (!fiber) throw new Error("useEffect must be used inside component");

  const hookIndex = getHookIndex();

  const prevFiber = fiber.alternate;
  const prevHook = prevFiber?.hooks?.[hookIndex] as EffectHook | undefined;

  let hasChanged = true;

  if (prevHook && deps) {
    hasChanged = !areHookInputsEqual(deps, prevHook.deps);
  }

  const newHook: EffectHook = {
    type: HookType.EFFECT,
    create,
    deps,
    cleanup: prevHook?.cleanup,
  };

  fiber.hooks = fiber.hooks ?? [];
  fiber.hooks[hookIndex] = newHook;

  if (hasChanged) {
    fiber.effects = fiber.effects ?? [];
    fiber.effects.push(newHook);
  }

  nextHookIndex();
}

const flushPassiveEffects = (fiber: RectifyFiber) => {
  if (fiber.effects) {
    for (const effect of fiber.effects) {
      // cleanup first
      if (effect.cleanup) {
        effect.cleanup();
      }

      const cleanup = effect.create();
      if (isFunction(cleanup)) {
        effect.cleanup = cleanup;
      }
    }

    fiber.effects = [];
  }

  let child = fiber.child;
  while (child) {
    flushPassiveEffects(child);
    child = child.sibling;
  }
};

export { useEffect, flushPassiveEffects };
