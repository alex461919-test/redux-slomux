import { createStore } from "./App";

//const fakeReducer = jest.fn((state, action) => state);

const fakeReducer = (state: any, action: any) => action.payload;

const fakeState1 = {
  key1: 1,
};
const fakeState2 = {
  key2: 2,
};
const fakeDispatch = (state?: any) => store.dispatch({ type: "", payload: state });

let store: any;
beforeEach(() => {
  store = createStore(fakeReducer, fakeState1);
});
test("Store is object", () => {
  expect(store).toHaveProperty("getState");
  expect(store).toHaveProperty("dispatch");
  expect(store).toHaveProperty("subscribe");
  //
  expect(typeof store.getState).toBe("function");
  expect(typeof store.dispatch).toBe("function");
  expect(typeof store.subscribe).toBe("function");
});
test("После создании state совпадает с дефолтным", () => {
  expect(store.getState()).toBe(fakeState1);
});
test("dispatch", () => {
  store.dispatch({ type: "", payload: fakeState2 });
  expect(store.getState()).toBe(fakeState2);
});
test("Callbacks", () => {
  const callbacks = [jest.fn(), jest.fn(), jest.fn()];
  const unsubscribers = callbacks.map((item) => store.subscribe(item));

  const testCalls = (calls: any[]) => calls.forEach((item, index) => expect(callbacks[index]).toHaveBeenCalledTimes(item));

  fakeDispatch();
  testCalls([1, 1, 1]);

  unsubscribers[1]();
  fakeDispatch();
  testCalls([2, 1, 2]);

  unsubscribers[0]();
  fakeDispatch();
  testCalls([2, 1, 3]);

  unsubscribers[2]();
  fakeDispatch();
  testCalls([2, 1, 3]);
});
