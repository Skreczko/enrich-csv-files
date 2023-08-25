import { CombinedState, configureStore } from '@reduxjs/toolkit';

import { Reducer } from 'react';
import { ReducersMapObject } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';

export const storeReducer: Reducer<CombinedState<any>, any> | ReducersMapObject = {

};

export const store = configureStore({
  reducer: storeReducer,
});

export type RootState = ReturnType<typeof store.getState>;

setupListeners(store.dispatch);