import { Fiber } from "@rectify/rectify-fiber/RectifyFiberTypes";
import { createRectifyHookBuilder } from "./RectifyHookBuilder";
import { Dispatcher, RectifyHook, Update } from "./RectifyHookTypes";
import { isFunction } from "@rectify/shared/utilities";

const {
  setCurrentlyRenderingFiber,
  getCurrentlyRenderingFiber,
  setFiberHookIndex,
  getFiberHookIndex,
  setScheduleUpdateOnFiber: setScheduleUpdateOnFiberAction,
  scheduleUpdateOnFiber,
} = createRectifyHookBuilder();

export const setScheduleUpdateOnFiber = setScheduleUpdateOnFiberAction;

export class RectifyHookRenderer {
  constructor(
    private fiber: Fiber,
    private Component: Function,
    private props: any,
  ) {}

  render() {
    setCurrentlyRenderingFiber(this.fiber);
    setFiberHookIndex(0);
    const children = this.Component(this.props);
    setCurrentlyRenderingFiber(null);
    setFiberHookIndex(0);
    return children;
  }
}

export const useState = <T>(
  initialValue: T | (() => T),
): [T, Dispatcher<T>] => {
  const currentFiber = getCurrentlyRenderingFiber()!;

  const hook = updateFiberHook<T>(currentFiber);

  // Initialize state on first render
  if (hook.memoizedState === undefined) {
    hook.memoizedState = isFunction(initialValue)
      ? initialValue()
      : initialValue;
  }

  // Process updates
  if (hook.queue !== null) {
    const queue = hook.queue;
    let update = queue.pending;

    if (update !== null) {
      let newState = hook.memoizedState;

      // Process circular linked list of updates
      const first = update;
      do {
        const action = update.action;
        newState = isFunction(action) ? action(newState) : action;
        update = update?.next!
      } while (update !== first);

      hook.memoizedState = newState;
      queue.pending = null;
    }
  }

  const setState: Dispatcher<T> = (action) => {
    const update: Update<T> = {
      action,
      next: null,
    };

    // Initialize queue if needed
    if (hook.queue === null) {
      hook.queue = {
        pending: null,
      };
    }

    const queue = hook.queue;

    // Add update to circular linked list
    if (queue.pending === null) {
      update.next = update;
    } else {
      update.next = queue.pending.next!;
      queue.pending.next = update;
    }
    queue.pending = update;

    // Schedule re-render
    scheduleUpdateOnFiber(currentFiber);
  };

  return [hook.memoizedState, setState];
};

const updateFiberHook = <T>(fiber: Fiber): RectifyHook<T> => {
  let hook: RectifyHook;

  const currentHook = getCurrentHook(fiber);

  if (currentHook === null) {
    // Mount - create new hook
    hook = {
      memoizedState: undefined,
      queue: null,
      next: null,
    };
  } else {
    // Update - clone hook
    hook = {
      memoizedState: currentHook.memoizedState,
      queue: currentHook.queue,
      next: null,
    };
  }

  // Add hook to fiber's hook list
  if (fiber.memorizedHook === null) {
    fiber.memorizedHook = hook;
  } else {
    // Find last hook and append
    let lastHook = fiber.memorizedHook;
    while (lastHook.next !== null) {
      lastHook = lastHook.next;
    }
    lastHook.next = hook;
  }

  let index = getFiberHookIndex();
  setFiberHookIndex(index++);
  return hook;
};

const getCurrentHook = (fiber: Fiber): RectifyHook | null => {
  const alternate = fiber.alternate;
  if (alternate === null) {
    return null;
  }

  let hook = alternate.memorizedHook;
  for (let i = 0; i < getFiberHookIndex(); i++) {
    if (hook === null) return null;
    hook = hook.next;
  }

  return hook;
};
