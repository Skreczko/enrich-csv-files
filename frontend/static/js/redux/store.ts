import { CombinedState, configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'react';
import { ReducersMapObject } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import fileListParamReducer from './FileListParamSlice';
import fileListReducer from './FileListSlice';
import notificationPopupReducer from './NotificationPopupSlice';
import previewListReducer from './PreviewListReducer';
import taskListReducer from './TaskListReducer';
import uploadSectionReducer from './UploadSectionSlice';

export const storeReducer: Reducer<CombinedState<any>, any> | ReducersMapObject = {
  fileList: fileListReducer,
  fileListParam: fileListParamReducer,
  notificationPopup: notificationPopupReducer,
  previewList: previewListReducer,
  taskList: taskListReducer,
  uploadSection: uploadSectionReducer,
};

export const store = configureStore({
  reducer: storeReducer,
});

export type RootState = ReturnType<typeof store.getState>;

setupListeners(store.dispatch);
