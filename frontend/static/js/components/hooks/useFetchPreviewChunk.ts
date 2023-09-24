import { useDispatch, useSelector } from 'react-redux';
import { updateFileElement } from '../../redux/FileListSlice';
import { fetchChunkData, fetchUploadDetails } from '../../api/actions';
import { PreviewDetail, PreviewType, setChunkData } from '../../redux/PreviewListReducer';
import { useEffect, useState } from 'react';
import { RootState } from '../../redux/store';

export const useFetchPreviewChunk = (
  uuid: string,
): { loading: boolean; notFound: boolean; foundPreviewDetail: PreviewDetail } => {
  const dispatch = useDispatch();
  const previewList: PreviewType = useSelector((state: RootState) => state.previewList);

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const foundPreviewDetail = previewList[uuid];

  const loadPreviewChunk = async (): Promise<void> => {
    const { chunk_number, chunk_size, headers, rows, total_rows } = await fetchChunkData(uuid);
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
  };

    const loadMorePreviewChunk = async (): Promise<void> => {
    const { chunk_number, chunk_size, headers, rows, total_rows } = await fetchChunkData(uuid);
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
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        await loadPreviewChunk();
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    const handleScroll = (element: any): void => {
    // const element = containerRef.current;

    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollPosition = Math.ceil(((scrollTop + clientHeight) / scrollHeight) * 100);

      if (scrollPosition >= 75) {
        // loadMorePreviewChunk();
      }
    }
  };


  return { loading, notFound, foundPreviewDetail, handleScroll };
};
