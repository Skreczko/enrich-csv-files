import React, { Dispatch, ReactElement } from 'react';
import { Queries, render as rtlRender, RenderResult } from '@testing-library/react';
import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { ValidateSliceCaseReducers } from '@reduxjs/toolkit/dist/createSlice';
import { RootState, storeReducer } from '../redux/store';
import { MemoryRouter as Router } from 'react-router-dom';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { renderHook, WaitForNextUpdate } from '@testing-library/react-hooks';

interface RenderOptions {
  preloadedState?: RootState;
  store?: ReturnType<typeof configureStore>;
  [key: string]: any;
}

function render(
  ui: React.ReactElement,
  extraReducers: ValidateSliceCaseReducers<any, any>[] = [],
  options: RenderOptions = {},
): {
  store: { getState: () => RootState; dispatch: Dispatch<AnyAction> };
  renderResult: RenderResult;
} {
  const { preloadedState, store: customStore, ...renderOptions } = options;

  const store =
    customStore ||
    configureStore({
      reducer: storeReducer,
      preloadedState,
    });

  setupListeners(store.dispatch);

  const Wrapper = ({ children }: { children: ReactElement }): JSX.Element => {
    for (const reducerAction of extraReducers) {
      store.dispatch(reducerAction);
    }
    return (
      <Provider store={store}>
        <Router>{children}</Router>
      </Provider>
    );
  };

  const renderResult = rtlRender(ui, { wrapper: Wrapper, ...renderOptions });

  return { store, renderResult };
}
// re-export everything
export * from '@testing-library/react';
// override render method
export { render };

// CUSTOM HOOK RENDER
// todo not working correctly. To fix in future development
export const prepareRenderHook = <HookResult extends Queries, HookArgs extends any[]>(
  customHookFactory: (...args: HookArgs) => () => HookResult,
  ...hookArgs: HookArgs
): {
  store: ToolkitStore<any, any, [ThunkMiddleware<any, AnyAction, undefined>]>;
  result: RenderResult<HookResult>;
  waitForNextUpdate: WaitForNextUpdate;
} => {
  const store = configureStore({
    reducer: storeReducer,
  });

  const customHook = customHookFactory(...hookArgs);

  const { result, waitForNextUpdate } = renderHook<{}, HookResult>(customHook, {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  // @ts-ignore
  return { store, result, waitForNextUpdate };
};
