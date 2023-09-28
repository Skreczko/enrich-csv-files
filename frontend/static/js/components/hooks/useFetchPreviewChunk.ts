import { useDispatch, useSelector } from 'react-redux';
import { fetchChunkData } from '../../api/actions';
import {
  laodMoreChunkData,
  PreviewDetail,
  PreviewType,
  setChunkData,
} from '../../redux/PreviewListReducer';
import { useCallback, useEffect, useState } from 'react';
import { RootState } from '../../redux/store';
import { debounce } from 'lodash';

type ScrollInfo = {
  visibleRowStartIndex: number;
  visibleRowStopIndex: number;
};

export const useFetchPreviewChunk = (
  uuid: string,
): {
  initialLoading: boolean;
  chunkLoading: boolean;
  notFound: boolean;
  foundPreviewDetail: PreviewDetail;
  handleScrollDebounced: (scrollInfo: ScrollInfo) => void;
} => {
  const dispatch = useDispatch();
  const previewList: PreviewType = useSelector((state: RootState) => state.previewList);

  const [initialLoading, setInitialLoading] = useState(true);
  const [chunkLoading, setChunkLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const foundPreviewDetail = previewList[uuid];

  const loadPreviewChunk = async () => {
    try {
      const { chunk_number, chunk_size, headers, rows, total_rows } = await fetchChunkData(uuid, {
        chunk_number: 0,
      });
      dispatch(
        setChunkData({
          [uuid]: {
            chunkSize: chunk_size,
            headers,
            lastChunkNumber: chunk_number,
            rows,
            totalRows: total_rows,
          },
        }),
      );
    } catch (error) {
      setNotFound(true);
    }
  };

  const loadMorePreviewChunk = async () => {
    if (!foundPreviewDetail) return;

    const chunksLeft = Math.ceil(foundPreviewDetail.totalRows / foundPreviewDetail.chunkSize);
    const nextChunkNumber = foundPreviewDetail.lastChunkNumber + 1;

    if (nextChunkNumber < chunksLeft) {
      const { chunk_number, rows } = await fetchChunkData(uuid, {
        chunk_number: nextChunkNumber,
      });
      dispatch(
        laodMoreChunkData({ uuid, loadMorePreview: { rows, lastChunkNumber: chunk_number } }),
      );
    }
  };

  useEffect(() => {
    loadPreviewChunk().then(() => setInitialLoading(false));
  }, [uuid]);

  const debouncedHandleScroll = debounce(
    async ({ visibleRowStartIndex, visibleRowStopIndex }: ScrollInfo) => {
      console.log("aaaaaaa start end", visibleRowStartIndex, visibleRowStopIndex);

      const totalRows = foundPreviewDetail?.totalRows || 0;
      if (totalRows - visibleRowStopIndex <= 0.25 * totalRows && !chunkLoading) {
        setChunkLoading(true);
        await loadMorePreviewChunk();
        setChunkLoading(false);
      }
    },
    150,
  );

  const handleScrollDebounced = useCallback(debouncedHandleScroll, [chunkLoading, foundPreviewDetail]);

  return { initialLoading, chunkLoading, notFound, foundPreviewDetail, handleScrollDebounced };
};
