import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum FileStatusEnum {
  LOADED = 'loaded',
  UPLOADED = 'uploaded',
  UPLOAD_ERROR = 'upload_error',
}

export type FileDetailsType = {
  fileName: string;
  status: FileStatusEnum;
  streaming_value?: number; // max 100
  uuid: string;
  size: number;
};


const fileDetailsManagementSlice = createSlice({
  name: 'fileDetailsManagementReducer',
  initialState: [] as FileDetailsType[],
  reducers: {
    setFileDetails: (state, { payload: fileDetailsList }: PayloadAction<FileDetailsType[]>) => [
      ...state,
      ...fileDetailsList,
    ],
    updateFileDetail: (state, { payload: updateData }: PayloadAction<Partial<FileDetailsType>>) => {
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
