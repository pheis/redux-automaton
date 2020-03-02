import * as redux from 'redux';

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

describe('createStore', () => {
  it('calls reducer actions', () => {
    const store = automaton.createStore(reducer, initialState);
    store.dispatch({ type: 'Increment' });
    const state = store.getState();
    expect(state.value).toEqual(11);
  });
  it('Works with normal reducer', () => {
    const store = automaton.createStore(reducer, initialState);
    store.dispatch({ type: 'Decrement' });
    const state = store.getState();
    expect(state.value).toEqual(-1);
  });
  it('Can do both', () => {
    const store = automaton.createStore(reducer, initialState);
    store.dispatch({ type: 'Increment' });
    store.dispatch({ type: 'Decrement' });
    const state = store.getState();
    expect(state.value).toEqual(10);
  });
  it('increments twice', () => {
    const store = automaton.createStore(reducer, initialState);
    store.dispatch({ type: 'Increment' });
    store.dispatch({ type: 'Increment' });
    const state = store.getState();
    expect(state.value).toEqual(12);
  });
});
