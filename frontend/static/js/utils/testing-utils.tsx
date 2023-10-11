import React, { ReactElement } from 'react';
import { render as rtlRender, RenderResult } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
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
): RenderResult {
  const { preloadedState, store: customStore, ...renderOptions } = options;

  const storeToUse =
    customStore ||
    configureStore({
      reducer: storeReducer,
      preloadedState,
    });

  setupListeners(storeToUse.dispatch);

  const Wrapper = ({ children }: { children: ReactElement }): JSX.Element => {
    for (const reducerAction of extraReducers) {
      storeToUse.dispatch(reducerAction);
    }
    return (
      <Provider store={storeToUse}>
        <Router>{children}</Router>
      </Provider>
    );
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };
