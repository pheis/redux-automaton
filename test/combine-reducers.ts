import * as automaton from '../src';

type State = { str: string; num: number; obj: { val: number } };
const initialState: State = { str: '', num: 0, obj: { val: 0 } };

type Action =
  | { type: 'concat'; payload: string }
  | { type: 'actuallyConcat'; payload: string }
  | { type: 'inc' }
  | { type: 'dec' }
  | { type: 'objInc' };

function strReducer(
  state: State['str'] | undefined = '',
  action: Action,
): automaton.Loop<State['str'], Action> | State['str'] {
  switch (action.type) {
    case 'concat':
      return automaton.loop(state, {
        type: 'actuallyConcat',
        payload: action.payload,
      });
    case 'actuallyConcat':
      return state + action.payload;
    default:
      return state;
  }
}

function numReducer(
  state: number | undefined = 0,
  action: Action,
): automaton.Loop<number, Action> | number {
  switch (action.type) {
    case 'inc':
      return state + 1;
    case 'dec':
      return state - 1;
    default:
      return state;
  }
}

function objReducer(
  state: State['obj'] | undefined = { val: 0 },
  action: Action,
): automaton.Loop<State['obj'], Action> | State['obj'] {
  switch (action.type) {
    case 'objInc':
      if (state.val < 10) {
        return automaton.loop({ val: state.val + 1 }, { type: 'objInc' });
      } else {
        return { val: state.val + 1 };
      }
    default:
      return state;
  }
}

describe('combineReducers', () => {
  it('num reducer works', () => {
    const rootReducer: automaton.Reducer<
      State,
      Action
    > = automaton.combineReducers({
      str: strReducer,
      num: numReducer,
      obj: objReducer,
    });
    const store = automaton.createStore(rootReducer, initialState);
    store.dispatch({ type: 'inc' });
    const state = store.getState();
    expect(state.num).toEqual(1);
  });
});

