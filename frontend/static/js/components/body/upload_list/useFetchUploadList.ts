import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFileList, setIsLoading } from '../../../redux/FileListSlice';
import { ApiAction, fetchUploadList } from '../../../api/actions';
import { FileListManagementType } from '../../../redux/FileListManagementSlice';
import { RootState } from '../../../redux/store';

export const useFetchUploadList = (providedParams: FileListManagementType = null): void => {
  const dispatch = useDispatch();
  let params: FileListManagementType;
  if (!providedParams) {
    params = useSelector((state: RootState) => state.fileListManagement);
  } else {
    params = providedParams;
  }

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      dispatch(setIsLoading(true));
      try {
        const response = await fetchUploadList({ action: ApiAction.FETCH_UPLOAD_LIST, ...params });
        dispatch(setFileList(response));
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
