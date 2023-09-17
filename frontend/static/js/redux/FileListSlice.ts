import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CsvFileElement, PaginatorType } from '../api/types';

export type FileListState = {
  fileList: CsvFileElement[];
  paginator: PaginatorType;
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
    updateFileElement: (
      state,
      {
        payload: { uuid, csv_detail },
      }: PayloadAction<{ uuid: string; csv_detail: CsvFileElement }>,
    ) => {
      const index = state.fileList.findIndex(file => file.uuid === uuid);
      if (index !== -1) {
        state.fileList[index] = csv_detail;
      }
    },
    setPaginator: (state, { payload: value }: PayloadAction<PaginatorType>) => {
      state.paginator = value;
    },
  },
});

export const { setFileList, setIsLoading, setPaginator, updateFileElement } = fileListSlice.actions;

export default fileListSlice.reducer;
