import React, { Dispatch, ReactElement } from 'react';
import { render as rtlRender, RenderResult } from '@testing-library/react';
import { AnyAction, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { ValidateSliceCaseReducers } from '@reduxjs/toolkit/dist/createSlice';
import { RootState, storeReducer } from '../redux/store';
import { MemoryRouter as Router } from 'react-router-dom';

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
