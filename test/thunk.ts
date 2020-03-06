import * as redux from 'redux';
import thunk from 'redux-thunk';
import * as automaton from '../src';

type State = { value: number };
const initialState = { value: 0 };

type Action = { type: 'Increment' } | { type: 'Decrement' };

function reducer(
  state: State | undefined = initialState,
  action: Action,
): automaton.Loop<State, Action> | State {
  switch (action.type) {
    case 'Increment':
      if (state.value < 10) {
        return automaton.loop(
          { value: state.value + 1 },
          { type: 'Increment' },
        );
      } else {
        return { value: state.value + 1 };
      }
    case 'Decrement':
      return { ...state, value: state.value - 1 };
  }
}

const incrementCreator: any = (dispatch: any) => {
  dispatch({ type: 'Increment' });
};

describe('thunk', () => {
  it('thunks', () => {
    const store = automaton.createStore(
      reducer,
      initialState,
      redux.applyMiddleware(thunk),
    );
    store.dispatch(incrementCreator);
    store.dispatch({ type: 'Decrement' });
    const state = store.getState();
    expect(state.value).toEqual(10);
  });
  it('thunks, loop, reduces', () => {
    const toC: any = (dispatch: any) => dispatch({ type: '->C' });
    const toD: any = (dispatch: any) => dispatch({ type: '->D' });
    type S = 'A' | 'B' | 'C' | 'D';
    type A = { type: '->B' | '->C' | '->D' };
    const r: automaton.Reducer<S, A> = (s = 'A', a) => {
      if (s === 'A' && a.type === '->B') {
        return automaton.loop('B', toC);
      }
      if (s === 'B' && a.type === '->C') {
        return automaton.loop('C', toD);
      }
      if (s === 'C' && a.type === '->D') {
        return 'D';
      }
      return s;
    };
    const store = automaton.createStore(
      r,
      'A' as const,
      redux.applyMiddleware(thunk),
    );
    store.dispatch({ type: '->B' });
    expect(store.getState()).toEqual('D');
  });
});
