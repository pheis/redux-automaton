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
});
