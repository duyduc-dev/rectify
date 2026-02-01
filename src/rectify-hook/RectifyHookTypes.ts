import { LinkedList } from "@rectify/shared/LinkedList";

export type HookState<T = any> = {
  initialValue: T;
  index: number;
  queue: LinkedList<RectifyHookQueue<T>>;
  next: LinkedList<HookState>;
};

export type RectifyHookQueue<T = any> = {
  action: RectifyHookAction<T>;
};

export type RectifyHookAction<T> = T | ((prevState: T) => T);
