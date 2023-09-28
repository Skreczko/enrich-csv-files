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

  // Used before the first fetch to display a prominent spinner.
  const [initialLoading, setInitialLoading] = useState(true);
  // This is used to display a spinner at the end of the table to indicate chunk data loading.
  // If there's a prolonged request for chunk data, the user will see the spinner as the last row.
  // In most cases, since the chunk is fetched when user reaches 75% of the current data length, so the user won't notice it.
  const [chunkLoading, setChunkLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const foundPreviewDetail = previewList[uuid];

  const loadPreviewChunk = async (): Promise<void> => {
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

  const loadMorePreviewChunk = async (): Promise<void> => {
    if (!foundPreviewDetail) return;

    const chunksLeft = Math.ceil(foundPreviewDetail.totalRows / foundPreviewDetail.chunkSize);
    const nextChunkNumber = foundPreviewDetail.lastChunkNumber + 1;

    if (nextChunkNumber < chunksLeft) {
      setChunkLoading(true);
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

  const debouncedHandleScroll = debounce(async ({ visibleRowStopIndex }: ScrollInfo) => {
    const totalRows = foundPreviewDetail?.totalRows || 0;
    const currentRowsLength =
      foundPreviewDetail.chunkSize * (foundPreviewDetail.lastChunkNumber + 1);
    if (
      !chunkLoading && // check if not during loading
      visibleRowStopIndex > 0.75 * currentRowsLength && // check if user reached 75% data to load
      totalRows >= currentRowsLength
    ) {
      await loadMorePreviewChunk();
      setChunkLoading(false);
    }
  }, 150);

  // We separate the creation of the debounced function from the useCallback to ensure that
  // the reference to handleScrollDebounced remains consistent across renders.
  // This is crucial because lodash's debounce creates a new function each time it's invoked,
  // which would cause the reference to change on every render if combined directly within useCallback.
  // By keeping them separate, we avoid unnecessary re-renders of child components that might depend
  // on this function as a prop or in other hooks.
  const handleScrollDebounced = useCallback(debouncedHandleScroll, [
    chunkLoading,
    foundPreviewDetail,
  ]);

  return { initialLoading, chunkLoading, notFound, foundPreviewDetail, handleScrollDebounced };
};
