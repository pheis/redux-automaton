import * as redux from 'redux';

import * as loop from './loop';

export type Reducer<S, A extends redux.Action<any>> = (
  state: S | undefined,
  action: A,
) => loop.Loop<S, A> | S;

function liftReducer<S, A extends redux.Action<any>>(
  actionQueue: A[],
  reducer: Reducer<S, A>,
): redux.Reducer<S, A> {
  return (s: S | undefined, a: A) => {
    const { state, actions } = loop.liftState(reducer(s, a));
    actionQueue.push(...actions);
    return state;
  };
}
export function storeEnhancer<S, A extends redux.Action<any>>(
  next: redux.StoreCreator,
) {
  return (
    reducer: Reducer<S, A>,
    initialState: redux.PreloadedState<S>,
    enhancer: any,
  ) => {
    const actionQueue: any[] = [];
    const store = next(
      liftReducer(actionQueue, reducer),
      initialState,
      enhancer,
    );
    store.subscribe(() => {
      while (actionQueue.length) {
        const nextAction = actionQueue.shift();
        if (nextAction) {
          store.dispatch(nextAction);
        }
      }
    });
    const replaceReducer: any = (reducer: any) => {
      return store.replaceReducer(liftReducer(actionQueue, reducer));
    };
    return {
      ...store,
      replaceReducer,
    };
  };
}

export function createStore<S, A extends redux.Action<any>, Ext, StateExt>(
  reducer: Reducer<S, A>,
  initialState: redux.PreloadedState<S>,
  anotherEnhancer?: redux.StoreEnhancer<Ext, StateExt>,
) {
  const storeEnhancerAny: any = storeEnhancer;
  const enhancer = anotherEnhancer
    ? redux.compose(storeEnhancerAny, anotherEnhancer)
    : storeEnhancerAny;
  return redux.createStore<S, A, Ext, StateExt>(
    reducer as any,
    initialState,
    enhancer,
  );
}
