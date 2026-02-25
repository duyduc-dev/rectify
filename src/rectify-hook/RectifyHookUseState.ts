import { isFunction } from "@rectify/shared/utilities";
import {
  getCurrentlyRenderingFiber,
  getHookIndex,
  nextHookIndex,
} from "./RectifyHookRenderingFiber";
import {
  Hook,
  HookType,
  StateDispatcher,
  StateHook,
  StateUpdater,
} from "./RectifyHookTypes";
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
  console.log("useState_fiber", fiber);

  if (!fiber)
    throw new Error("useState must be used within a function component.");

  const hookIndex = getHookIndex();
  const prevFiber = fiber.alternate;
  const prevHook = prevFiber?.hooks?.[hookIndex] as
    | StateHook<S | undefined>
    | undefined;

  const newHook: Hook<S | undefined> = prevHook
    ? {
        type: HookType.STATE,
        state: prevHook.state,
        queue: prevHook.queue,
      }
    : {
        type: HookType.STATE,
        state: getInitialState(initialState),
        queue: [],
      };

  fiber.hooks = fiber.hooks ?? [];
  fiber.hooks[hookIndex] = newHook;

  if (newHook.queue.length > 0) {
    for (const update of newHook.queue) {
      newHook.state = getState(update, newHook.state);
    }
    newHook.queue = [];
  }

  const dispatch: StateDispatcher<S | undefined> = (updater) => {
    const newState = isFunction(updater) ? updater(newHook.state) : updater;
    if (newState === newHook.state) return;
    newHook.queue.push(updater);
    scheduleUpdateOnFiber(fiber);
  };

  nextHookIndex();
  return [newHook.state, dispatch] as const;
}
