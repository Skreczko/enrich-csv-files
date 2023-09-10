import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FileListManagementType = {
  fileList: any;
  isLoading: boolean;
};

const fileListSlice = createSlice({
  name: 'fileListReducer',
  initialState: {
    fileList: null,
    isLoading: false,
  } as FileListManagementType,
  reducers: {
    setFileList: (state, { payload: value }: PayloadAction<any>) => {
      state.fileList = value;
    },
    setIsLoading: (state, { payload: value }: PayloadAction<any>) => {
      state.isLoading = value;
    },
  },
});

export const { setFileList, setIsLoading } = fileListSlice.actions;

export default fileListSlice.reducer;
