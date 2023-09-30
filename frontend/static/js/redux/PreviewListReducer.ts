import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PreviewDetail = {
  lastChunkNumber: number; // starts from 0
  chunkSize: number;
  totalRows: number;
  headers: string[];
  rows: any[][];
};

export type LoadMorePreview = Pick<PreviewDetail, 'lastChunkNumber' | 'rows'>;

export type PreviewType = { [key: string]: PreviewDetail };

const previewListSlice = createSlice({
  name: 'previewList',
  initialState: {} as PreviewType,
  reducers: {
    setChunkData: (state, { payload: preview }: PayloadAction<PreviewType>) => {
      return { ...state, ...preview };
    },
    laodMoreChunkData: (
      state,
      action: PayloadAction<{
        uuid: string;
        loadMorePreview: LoadMorePreview;
      }>,
    ) => {
      const { uuid, loadMorePreview } = action.payload;
      state[uuid] = {
        ...state[uuid],
        lastChunkNumber: loadMorePreview.lastChunkNumber,
        rows: [...state[uuid].rows, ...loadMorePreview.rows],
      };
    },
    removeChunk: (state, { payload: uuid }: PayloadAction<string>) => {
      delete state[uuid];
    },
  },
});

export const { setChunkData, laodMoreChunkData, removeChunk } = previewListSlice.actions;

export default previewListSlice.reducer;
