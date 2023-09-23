import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PreviewDetail = {
  lastChunkNumber: number; // starts from 0
  chunkSize: number;
  headers: string[];
  rows: any[][];
};

export type PreviewType = { [key: string]: PreviewDetail };

const previewListSlice = createSlice({
  name: 'previewList',
  initialState: {} as PreviewDetail,
  reducers: {
    setChunkData: (state, { payload: preview }: PayloadAction<PreviewType>) => {
      return { ...state, ...preview };
    },

    // removeTasks: (state, { payload: removeTaskList }: PayloadAction<string[]>) => {
    //   removeTaskList.forEach(taskId => {
    //     delete state[taskId];
    //   });
    // },
  },
});

export const { setChunkData } = previewListSlice.actions;

export default previewListSlice.reducer;
