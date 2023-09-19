import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFileList, setIsLoading, setPaginator } from '../../redux/FileListSlice';
import { fetchUploadList } from '../../api/actions';
import { RootState } from '../../redux/store';
import { FileListParamState, setParams } from '../../redux/FileListParamSlice';
import { useLocation } from 'react-router-dom';

export const useFetchUploadList = (): ((
  updateParams?: Partial<FileListParamState>,
) => Promise<void>) => {
  const dispatch = useDispatch();
  const reduxParams = useSelector((state: RootState) => state.fileListParam);
  const location = useLocation();

  // State to determine if it's the first time the hook is being run. Used in case when query_params are provided and we want them to affect once
  const [isFirstRun, setIsFirstRun] = useState(true);

  const extractParamsFromURL = (): { [key: string]: string } => {
    const queryParams = new URLSearchParams(location.search);
    const paramsObject: { [key: string]: string } = {};
    queryParams.forEach((value, key) => {
      paramsObject[key] = value;
    });
    return paramsObject;
  };

  // We treat "reduxParams" as the base for our parameters. If a user wishes to fetch the upload list with specific parameters,
  // they should be provided through "updateParams" (ie, changing the page number in pagination). This will update the state in Redux,
  // and then an API request will be made using the updated parameters.
  const updateRequestParams = (
    updateParams: Partial<FileListParamState> = {},
  ): FileListParamState => {
    let params = { ...reduxParams, ...updateParams };

    if (isFirstRun) {
      params = { ...params, ...extractParamsFromURL() };
      setIsFirstRun(false);
    }

    dispatch(setParams(params));

    // as "filters" is an object - manually unpack
    if (params.filters) {
      params.filter_status = params.filters.status;
      params.filter_file_type = params.filters.file_type;
      params.filter_date_from = params.filters.date_from;
      params.filter_date_to = params.filters.date_to;
    }
    delete params.filters;

    return params;
  };

  const getUploadList = async (updateParams: Partial<FileListParamState> = {}): Promise<void> => {
    const params = updateRequestParams(updateParams);
    dispatch(setIsLoading(true));
    try {
      const { result, paginator } = await fetchUploadList(params);
      dispatch(setFileList(result));
      dispatch(setPaginator(paginator));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return getUploadList;
};
