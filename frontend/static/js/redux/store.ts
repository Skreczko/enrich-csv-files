import { CombinedState, configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'react';
import { ReducersMapObject } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import notificationPopupReducer from './NotificationPopupSlice';
import fileDetailsManagementReducer from './FileDetailsManagementSlice';
import fileListManagementReducer from './FileListManagementSlice';

export const storeReducer: Reducer<CombinedState<any>, any> | ReducersMapObject = {
  fileDetailsManagement: fileDetailsManagementReducer,
  fileListManagement: fileListManagementReducer,
  notificationPopup: notificationPopupReducer,
};

export const store = configureStore({
  reducer: storeReducer,
});

export type RootState = ReturnType<typeof store.getState>;

setupListeners(store.dispatch);
