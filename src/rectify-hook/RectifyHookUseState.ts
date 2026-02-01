import { Fiber } from "@rectify/rectify-reconciler/RectifyFiberTypes";
import { getCurrentFiberRendering } from "./RectifyHookCurrentFiber";
import { isFunction } from "@rectify/shared/utilities";
import { HookState, RectifyHookQueue } from "./RectifyHookTypes";
import { LinkedList } from "@rectify/shared/LinkedList";
import { batchUpdate } from "@rectify/rectify-reconciler/RectifyFiberReconciler";

type InitialState<T> = T | (() => T);

type Dispatch<T> = (value: T | ((prevState: T) => T)) => void;

const useState = <T>(initialState: InitialState<T>): [T, Dispatch<T>] => {
  const fiber = getCurrentFiberRendering();
  if (!fiber) {
    throw new Error("useState must be called within a rendering fiber.");
  }

  const hookState = getHookState(initialState, fiber);
  fiber.pendingState = hookState;

  hookState.initialValue = updateCurrentStateValue(hookState);

  const setState: Dispatch<T> = (value) => {
    const queue: RectifyHookQueue<T> = {
      action: value,
    };
    hookState.queue.append(queue);
    batchUpdate(fiber, () => {
      console.log("fiber updated");
    });
  };

  return [hookState.initialValue, setState] as const;
};

const updateCurrentStateValue = <T>(hookState: HookState<T>): T => {
  let value = hookState.initialValue;
  for (const state of hookState.queue) {
    value = isFunction(state.action) ? state.action(value) : state.action;
  }
  return value;
};

const createHookState = <T>(initialValue: InitialState<T>): HookState<T> => {
  const hookState: HookState<T> = {
    initialValue: isFunction(initialValue) ? initialValue() : initialValue,
    index: 0,
    queue: new LinkedList(),
    next: new LinkedList<HookState>(),
  };
  return hookState;
};

const getHookState = <T>(
  initialState: InitialState<T>,
  fiber: Fiber,
): HookState<T> => {
  let hookState: HookState<T> | null = fiber.pendingState;

  const index = hookState?.index ?? 0;

  for (let i = 0; i <= index; i++) {
    hookState = hookState?.next.headValue() ?? null;
  }

  return hookState ?? createHookState(initialState);
};

export { useState };
