import { CombinedState, configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'react';
import { ReducersMapObject } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import fileListManagementReducer from './FileListManagementSlice';
import fileListReducer from './FileListSlice';
import notificationPopupReducer from './NotificationPopupSlice';
import uploadSectionReducer from './UploadSectionSlice';

export const storeReducer: Reducer<CombinedState<any>, any> | ReducersMapObject = {
  fileDetailsManagement: uploadSectionReducer,
  fileList: fileListReducer,
  fileListManagement: fileListManagementReducer,
  notificationPopup: notificationPopupReducer,
};

export const store = configureStore({
  reducer: storeReducer,
});

export type RootState = ReturnType<typeof store.getState>;

setupListeners(store.dispatch);
