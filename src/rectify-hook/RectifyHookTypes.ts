export type StateUpdater<S> = S | ((prevState: S) => S);

export type Hook<S = any> = {
  state: S | undefined;
  queue: Array<StateUpdater<S | undefined>>;
};

export type StateDispatcher<S> = (state: StateUpdater<S>) => void;
