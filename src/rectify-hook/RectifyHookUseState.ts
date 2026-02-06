import { isFunction } from "@rectify/shared/utilities";
import {
  getCurrentlyRenderingFiber,
  getHookIndex,
  setHookIndex,
} from "./RectifyHookRenderingFiber";
import { Hook, StateDispatcher, StateUpdater } from "./RectifyHookTypes";
import { scheduleUpdateOnRoot } from "@rectify/rectify-reconciler/RectifyFiberReconciler";

const getInitialState = <S>(initialState: S | (() => S)): S =>
  isFunction(initialState) ? initialState() : initialState;

const getState = <S>(update: StateUpdater<S>, prevState: S) =>
  isFunction(update) ? update(prevState) : update;

export const useState = <S>(
  initialState: S | (() => S),
): [S, StateDispatcher<S>] => {
  const fiber = getCurrentlyRenderingFiber();
  const hookIndex = getHookIndex();

  if (!fiber) {
    throw new Error("useState() must be called inside a function component.");
  }

  const prevFiber = fiber.alternate;
  const prevHook = prevFiber?.hooks?.[hookIndex] as Hook<S> | undefined;

  // reuse SAME queue reference
  const hook: Hook<S> = prevHook
    ? { state: prevHook.state, queue: prevHook.queue }
    : { state: getInitialState(initialState), queue: [] };

  console.log("hook", hook);

  // consume updates exactly once
  if (hook.queue.length) {
    for (const update of hook.queue) {
      hook.state = getState(update, hook.state);
    }
    hook.queue.length = 0;
  }

  fiber.hooks = fiber.hooks ?? [];
  fiber.hooks[hookIndex] = hook;

  const dispatch: StateDispatcher<S> = (update) => {
    console.log("hook", { hook, fiber });

    const committed = fiber.alternate;
    if (!committed) return;

    const committedHook = committed.hooks?.[hookIndex];
    if (!committedHook) return;

    committedHook.queue.push(update);
    scheduleUpdateOnRoot();
  };

  setHookIndex(hookIndex + 1);
  return [hook.state, dispatch];
};
