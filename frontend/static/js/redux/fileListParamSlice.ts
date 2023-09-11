import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortList } from '../api/enums';

export type FileListParamState = {
  search: string;
  page: number;
  sort: SortList;
  page_size: number; //todo assing correct type
};

const fileListParamSlice = createSlice({
  name: 'fileListParamReducer',
  initialState: {
    search: '',
    page: 1,
    sort: SortList.CREATED_DESC,
    page_size: 20,
  } as FileListParamState,
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
