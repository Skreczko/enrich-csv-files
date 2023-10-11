import React, { ReactElement } from 'react';
import { render as rtlRender, RenderResult } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { ValidateSliceCaseReducers } from '@reduxjs/toolkit/dist/createSlice';
import {RootState, storeReducer} from '../redux/store';

function render(
  ui: React.ReactElement,
  // used to setup redux state before rendering component
  extraReducers: ValidateSliceCaseReducers<any, any>[] = [],
  {
    preloadedState = {} as RootState,
    store = configureStore({
      reducer: storeReducer,
      preloadedState,
    }),
    ...renderOptions
  } = {},
): RenderResult {
  setupListeners(store.dispatch);

  const Wrapper = ({ children }: { children: ReactElement }): JSX.Element => {
    for (const reducerAction of extraReducers) {
      store.dispatch(reducerAction);
    }
    return <Provider store={store}>{children}</Provider>;
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };
