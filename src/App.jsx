import React from "react";

import "./index.css";

const ReactReduxContext = React.createContext(null);

export const createStore = (reducer, initialState) => {
  let currentState = initialState;
  const listeners = [];

  const getState = () => currentState;
  const dispatch = (action) => {
    currentState = reducer(currentState, action);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  return { getState, dispatch, subscribe };
};

export const useSelector = (selector, equalityFn) => {
  const store = React.useContext(ReactReduxContext);
  if (!store) throw new Error("The Redux context and store must be initialized!");
  const [selected, updateSelected] = React.useState(selector(store.getState()));

  React.useEffect(() => {
    const update = () => {
      const newSelected = selector(store.getState());
      if (newSelected === selected) return;
      if (typeof equalityFn === "function" && equalityFn(newSelected, selected)) return;
      updateSelected(newSelected);
    };
    const unsubscribe = store.subscribe(update);
    return () => unsubscribe();
  }, [equalityFn, selected, selector, store]);

  return selected;
};

export const useDispatch = () => {
  const store = React.useContext(ReactReduxContext);
  if (!store) throw new Error("The Redux context and store must be initialized!");
  return store.dispatch;
};

export const Provider = ({ store, context, children }) =>
  React.createElement((context || ReactReduxContext).Provider, { value: store }, children);

// actions
const UPDATE_COUNTER = "UPDATE_COUNTER";
const CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE";

// action creators
const updateCounter = (value) => ({
  type: UPDATE_COUNTER,
  payload: value,
});

const changeStepSize = (value) => ({
  type: CHANGE_STEP_SIZE,
  payload: value,
});

// reducers
const defaultState = {
  counter: 1,
  stepSize: 1,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      const counter = state.counter + action.payload * state.stepSize;
      return { ...state, counter };
    case CHANGE_STEP_SIZE:
      const stepSize = action.payload;
      return { ...state, stepSize };
    default: {
      //console.warn(`Unknown action ${action.type}`);
      return state;
    }
  }
};

// ВНИМАНИЕ! Использование собственной реализации useSelector и dispatch обязательно
const Counter = () => {
  const counter = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-1))}>-</button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(1))}>+</button>
    </div>
  );
};

const Step = () => {
  const stepSize = useSelector(
    (state) => state.stepSize,
    (current, prev) => current === prev
  );
  const dispatch = useDispatch();

  return (
    <div>
      <div>Значение счётчика должно увеличиваться или уменьшаться на заданную величину шага</div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) =>
          dispatch(changeStepSize(/* Примем утверждение - action changeStepSize работает только с типом number */ +target.value))
        }
      />
    </div>
  );
};

const App = () => (
  <Provider store={createStore(reducer, defaultState)}>
    <div style={{ padding: "32px" }}>
      <Step />
      <Counter />
    </div>
  </Provider>
);

export default App;
