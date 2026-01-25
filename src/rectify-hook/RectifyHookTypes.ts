export type Updater<T> = T | ((prev: T) => T);

export type Dispatcher<T> = (updater: Updater<T>) => void;

export type RectifyHook<T = any> = {
  memoizedState: T;
  queue: UpdateQueue<T> | null;
  next: RectifyHook<T> | null;
};

export type UpdateQueue<T> = {
  pending: Update<T> | null;
};

export type Update<T> = {
  action: Updater<T>;
  next: Update<T> | null;
};
