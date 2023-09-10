import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FileListParamState = {
  search: string;
  page: number;
};

const fileListParamSlice = createSlice({
  name: 'fileListParamReducer',
  initialState: {
    search: '',
    page: 1,
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
