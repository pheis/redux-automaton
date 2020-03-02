import * as redux from 'redux';

const loopSymbol = Symbol('loop');

export type Loop<S, A extends redux.Action<any>> = {
  type: typeof loopSymbol;
  state: S;
  actions: A[];
};

export function isLoop<S, A extends redux.Action<any>>(
  u: unknown,
): u is Loop<S, A> {
  const stateAny: any = u;
  if (
    typeof stateAny === 'object' &&
    !!stateAny &&
    'type' in stateAny &&
    stateAny['type'] === loopSymbol
  ) {
    return true;
  }
  return false;
}

export function loop<S, A extends redux.Action<any>>(
  state: S,
  ...actions: A[]
): Loop<S, A> {
  return {
    type: loopSymbol,
    state,
    actions,
  };
}

export function liftState<S, A extends redux.Action<any>>(
  state: Loop<S, A> | S,
): Loop<S, A> {
  return isLoop(state) ? state : loop(state);
}
