import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortList } from '../api/enums';

export type FileListParamState = {
  search: string;
  page: number;
  sort: SortList;
};

const fileListParamSlice = createSlice({
  name: 'fileListParamReducer',
  initialState: {
    search: '',
    page: 1,
    sort: SortList.CREATED_DESC,
  } as FileListParamState,
  reducers: {
    setSearch: (state, { payload: value }: PayloadAction<string>) => {
      state.search = value;
      state.page = 1;
    },
  },
});

export const { setSearch } = fileListParamSlice.actions;

export default fileListParamSlice.reducer;
