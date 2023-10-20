import { useDispatch } from 'react-redux';
import { updateFileElement } from '../../redux/FileListSlice';
import { fetchUploadDetails } from '../../api/actions';

export const useFetchUploadDetail = (): ((uuid: string) => Promise<void>) => {
  const dispatch = useDispatch();

  return async (uuid: string): Promise<void> => {
    try {
      const csv_detail = await fetchUploadDetails(uuid);
      dispatch(updateFileElement({ uuid, csv_detail }));
    } catch (error) {
      console.log(error);
    }
  };
};
