import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum FileStatusEnum {
  LOADED = 'loaded',
  UPLOADED = 'uploaded',
  UPLOAD_ERROR = 'upload_error',
}

export type FileListManagementType = {
  search: string;
  page: number;
};

const fileListManagementSlice = createSlice({
  name: 'fileListManagementReducer',
  initialState: {
    search: '',
    page: 1,
  } as FileListManagementType,
  reducers: {
    setSearch: (state, { payload: value }: PayloadAction<string>) => {
      state.search = value;
      state.page = 1;
    },
  },
});

export const { setSearch } = fileListManagementSlice.actions;

export default fileListManagementSlice.reducer;
