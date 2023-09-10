import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFileList, setIsLoading, setPaginator } from '../../../redux/FileListSlice';
import { fetchUploadList } from '../../../api/actions';
import { RootState } from '../../../redux/store';
import { FileListParamState } from '../../../redux/fileListParamSlice';
import { response } from 'msw';

import {ApiAction} from "../../../api/enums";

export const useFetchUploadList = (providedParams: FileListParamState = null): void => {
  const dispatch = useDispatch();
  let params: FileListParamState;
  if (!providedParams) {
    params = useSelector((state: RootState) => state.fileListParam);
  } else {
    params = providedParams;
  }

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      dispatch(setIsLoading(true));
      try {
        const { result, paginator } = await fetchUploadList({
          action: ApiAction.FETCH_UPLOAD_LIST,
          ...params,
        });
        console.log(33333333, response);
        dispatch(setFileList(result));
        dispatch(setPaginator(paginator));
      } catch (error) {
        //TODO notification
        console.log(error);
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchData();
  }, [params]);
};
