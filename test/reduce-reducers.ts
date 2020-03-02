import * as automaton from '../src';

type State = { value: string };
const initialState = { value: '' };

type Action =
  | { type: 'Add'; payload: string }
  | { type: 'ActuallyAdd'; payload: string };

function reducer1(
  state: State | undefined = initialState,
  action: Action,
): automaton.Loop<State, Action> | State {
  switch (action.type) {
    case 'Add':
      return automaton.loop(
        { value: state.value },
        { type: 'ActuallyAdd', payload: action.payload },
      );
    case 'ActuallyAdd':
      return { ...state, value: state.value + action.payload };
  }
}

function reducer2(
  state: State | undefined = initialState,
  action: Action,
): automaton.Loop<State, Action> | State {
  switch (action.type) {
    case 'Add':
      return automaton.loop(
        { value: state.value },
        { type: 'ActuallyAdd', payload: action.payload },
      );
    case 'ActuallyAdd':
      return {
        ...state,
        value:
          state.value +
          action.payload
            .split('')
            .reverse()
            .join(''),
      };
  }
}

describe('reduceReducers', () => {
  it('Order is first, ...rest, first, ...rest', () => {
    const store = automaton.createStore(
      automaton.reducerReducers(reducer1, reducer2),
      initialState,
    );
    store.dispatch({ type: 'Add', payload: 'AB' });
    const state = store.getState();
    expect(state.value).toEqual('ABBAABBA');
  });
  it('Calls all the reducers', () => {
    const store = automaton.createStore(
      automaton.reducerReducers(reducer2, reducer1),
      initialState,
    );
    store.dispatch({ type: 'Add', payload: 'A' });
    const state = store.getState();
    expect(state.value).toEqual('AAAA');
  });
});

