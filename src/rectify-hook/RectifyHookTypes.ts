export type StateUpdater<S> = S | ((prevState: S) => S);

export type Hook<S = any> = {
  state: S;
  queue: Array<S | StateUpdater<S>>;
};

export type StateDispatcher<S> = (state: StateUpdater<S>) => void;
