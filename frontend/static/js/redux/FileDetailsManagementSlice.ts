import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum FileStatusEnum {
  LOADED = 'loaded',
  UPLOADED = 'uploaded',
  UPLOAD_ERROR = 'upload_error',
}

export type FileDetailsManagementType = {
  fileName: string;
  status: FileStatusEnum;
  streaming_value?: number; // max 100
  uuid: string;
};

const fileDetailsManagementSlice = createSlice({
  name: 'fileDetailsManagementReducer',
  initialState: [] as FileDetailsManagementType[],
  reducers: {
    setFileDetails: (
      state,
      { payload: fileDetailsList }: PayloadAction<FileDetailsManagementType[]>,
    ) => [...state, ...fileDetailsList],
    updateFileDetail: (
      state,
      { payload: updateData }: PayloadAction<Partial<FileDetailsManagementType>>,
    ) => {
      return state.map(detail => {
        if (detail.uuid === updateData.uuid) {
          return { ...detail, ...updateData };
        }
        return detail;
      });
    },
  },
});

export const { setFileDetails, updateFileDetail } = fileDetailsManagementSlice.actions;

export default fileDetailsManagementSlice.reducer;
