import { isFunction } from "@rectify/shared/utilities";
import {
  getCurrentlyRenderingFiber,
  getHookIndex,
  setHookIndex,
} from "./RectifyHookRenderingFiber";
import { Hook, StateDispatcher, StateUpdater } from "./RectifyHookTypes";
import { scheduleUpdateOnFiber } from "@rectify/rectify-reconciler/RectifyFiberReconciler";

type StateInitializer<S> = S | (() => S);

const getInitialState = <S>(initialState: S | (() => S)): S =>
  isFunction(initialState) ? initialState() : initialState;

const getState = <S>(update: StateUpdater<S>, prevState: S) =>
  isFunction(update) ? update(prevState) : update;

export function useState<S>(): [S | undefined, StateDispatcher<S | undefined>];
export function useState<S>(initialState: S): [S, StateDispatcher<S>];
export function useState<S>(initialState: () => S): [S, StateDispatcher<S>];
export function useState<S>(
  initialState?: StateInitializer<S>,
): [S | undefined, StateDispatcher<S | undefined>] {
  const fiber = getCurrentlyRenderingFiber();
  if (!fiber)
    throw new Error("useState must be used within a function component.");

  const hookIndex = getHookIndex();
  const prevFiber = fiber.alternate;
  const prevHook = prevFiber?.hooks?.[hookIndex] as
    | Hook<S | undefined>
    | undefined;

  const newHook: Hook<S | undefined> = prevHook
    ? {
        state: prevHook.state,
        queue: prevHook.queue,
      }
    : {
        state: getInitialState(initialState),
        queue: [],
      };

  fiber.hooks = fiber.hooks ?? [];
  fiber.hooks[hookIndex] = newHook;

  let state = newHook.state;

  if (newHook.queue.length > 0) {
    for (const update of newHook.queue) {
      state = getState(update, state);
    }
  }

  const dispatch: StateDispatcher<S | undefined> = (updater) => {
    newHook.queue.push(updater);
    scheduleUpdateOnFiber(fiber);
  };

  setHookIndex(hookIndex + 1);
  return [state, dispatch];
}
