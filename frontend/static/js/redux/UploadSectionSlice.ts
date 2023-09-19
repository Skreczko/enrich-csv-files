import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileStatusEnum } from '../components/body/upload_csv/types';

export type UploadElementState = {
  fileName: string;
  status: FileStatusEnum;
  streaming_value?: number; // max 100
  uuid: string;
};

const uploadSectionSlice = createSlice({
  name: 'uploadSectionReducer',
  initialState: [] as UploadElementState[],
  reducers: {
    setFileDetails: (state, { payload: fileDetailsList }: PayloadAction<UploadElementState[]>) => [
      ...state,
      ...fileDetailsList,
    ],
    updateFileDetail: (
      state,
      { payload: updateData }: PayloadAction<Partial<UploadElementState>>,
    ) => {
      return state.map(detail => {
        if (detail.uuid === updateData.uuid) {
          return { ...detail, ...updateData };
        }
        return detail;
      });
    },
    clearFileDetails: state => {
      return state.filter(detail => detail.status !== FileStatusEnum.LOADED);
    },
  },
});

export const { setFileDetails, updateFileDetail, clearFileDetails } = uploadSectionSlice.actions;

export default uploadSectionSlice.reducer;
