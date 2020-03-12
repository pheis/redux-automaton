import * as redux from 'redux';
import { Reducer } from './store-enhancer';
import { liftState, loop, Loop } from './loop';

type Mapping<
  K extends string | number | symbol,
  A extends redux.Action<any>
> = {
  [Key in K]: (s: any, action: A) => any;
};

type InferState<A> = A extends Loop<infer B, any> ? B : A;
type InferAction<M> = M extends Mapping<any, infer A> ? A : redux.Action;

export function combineReducers<
  Action extends redux.Action,
  K extends string,
  M extends Mapping<K, Action>,
  State extends { [k in keyof M]: InferState<ReturnType<M[k]>> }
>(reducerMapObject: M): Reducer<State, InferAction<M>> {
  return (state: State | undefined, action: InferAction<M>) => {
    const keysAny: any = Object.keys(reducerMapObject);
    const keys: Array<keyof M> = keysAny;

    let combinedState: Partial<State> = {};
    let actions: InferAction<M>[] = [];
    for (const key of keys) {
      const prevState = !!state ? state[key] : undefined;
      const reducer = reducerMapObject[key];
      const {
        state: nextState,
        actions: nextActions,
      }: {
        state: State[keyof State];
        actions: InferAction<M>[];
      } = liftState(reducer(prevState, action as any));
      combinedState[key] = nextState;
      actions.push(...nextActions);
    }
    return loop(combinedState as State, ...actions);
  };
}
