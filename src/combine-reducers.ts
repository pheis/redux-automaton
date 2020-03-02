import * as redux from 'redux';
import { Reducer } from './store-enhancer';
import { liftState, loop } from './loop';

type ReducerMapObject<
  K extends string,
  S extends { [Key in K]: any },
  A extends redux.Action<any>
> = {
  [Key in K]: Reducer<S[Key], A>;
};

type State<
  K extends string,
  S extends { [Key in K]: any },
  A extends redux.Action<any>
> = {
  [Key in K]: Parameters<ReducerMapObject<K, S, A>[Key]>[0];
};

export function combineReducers<
  K extends string,
  S extends { [Key in K]: any },
  A extends redux.Action<any>
>(reducerMapObject: ReducerMapObject<K, S, A>): Reducer<State<K, S, A>, A> {
  return (state: State<K, S, A> | undefined, action: A) => {
    const keys: K[] = Object.keys(reducerMapObject) as K[];
    let combinedState: Partial<State<K, S, A>> = {};
    let actions: A[] = [];
    for (const key of keys) {
      const prevState = !!state ? state[key] : undefined;
      const reducer = reducerMapObject[key];
      const {
        state: nextState,
        actions: nextActions,
      }: {
        state: State<K, S, A>[K];
        actions: A[];
      } = liftState(reducer(prevState, action));
      combinedState[key] = nextState;
      actions.push(...nextActions);
    }
    return loop(combinedState as State<K, S, A>, ...actions);
  };
}
