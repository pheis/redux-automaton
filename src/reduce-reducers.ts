import * as redux from 'redux';
import { Reducer } from './store-enhancer';
import { liftState, loop, Loop } from './loop';

export function reducerReducers<S, A extends redux.Action<any>>(
  ...reducers: Reducer<S, A>[] // At least one reducer plz.
): Reducer<S, A> {
  return (state: S | undefined, action: A) =>
    reducers.reduce((acc: S | Loop<S, A>, reducer: Reducer<S, A>) => {
      const prevLoop: Loop<S | undefined, A> | S | undefined = acc;
      const { state: prevState, actions: prevActions } = liftState(prevLoop);
      const { state: nextState, actions: nextActions } = liftState(
        reducer(prevState, action),
      );
      return loop(nextState, ...prevActions, ...nextActions);
    }, state as S | Loop<S, A>); // state can be undefined
}
