import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortList } from '../api/enums';
import { FileListFilters, pageSizeType } from '../api/types';

export type FileListParamState = {
  search: string;
  page: number;
  sort: SortList;
  page_size: typeof pageSizeType;
  filters: FileListFilters;
};

export const fileListParamInitialState: FileListParamState = {
  search: '',
  page: 1,
  sort: SortList.CREATED_DESC,
  page_size: 20,
  filters: {
    status: null,
    file_type: null,
    date_from: null,
    date_to: null,
  },
};

const fileListParamSlice = createSlice({
  name: 'fileListParamReducer',
  initialState: fileListParamInitialState,
  reducers: {
    setSearch: (state, { payload: value }: PayloadAction<string>) => {
      state.search = value;
      state.page = 1;
    },
    setPage: (state, { payload: value }: PayloadAction<number>) => {
      state.page = value;
    },
    setParams: (state, { payload: params }: PayloadAction<FileListParamState>) => {
      return { ...state, ...params };
    },
  },
});

export const { setSearch, setPage, setParams } = fileListParamSlice.actions;

export default fileListParamSlice.reducer;
