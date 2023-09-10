import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CsvFileElement, Paginator } from '../api/types';

export type FileListState = {
  fileList: CsvFileElement[];
  paginator: Paginator;
  isLoading: boolean;
};

const fileListSlice = createSlice({
  name: 'fileListReducer',
  initialState: {
    fileList: null,
    paginator: null,
    isLoading: false,
  } as FileListState,
  reducers: {
    setFileList: (state, { payload: value }: PayloadAction<CsvFileElement[]>) => {
      state.fileList = value;
    },
    setIsLoading: (state, { payload: value }: PayloadAction<boolean>) => {
      state.isLoading = value;
    },
    setPaginator: (state, { payload: value }: PayloadAction<Paginator>) => {
      state.paginator = value;
    },
  },
});

export const { setFileList, setIsLoading, setPaginator } = fileListSlice.actions;

export default fileListSlice.reducer;
