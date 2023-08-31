import axios from 'axios';
import { FileType } from '../components/body/upload/UploadFile';
import { updateFileDetail } from '../redux/FileDetailsManagementSlice';
import { throttle } from 'lodash';
import { store } from '../redux/store';

const api = axios.create();

export async function upload_csv(fileElement: FileType): Promise<any> {
  const formData = new FormData();
  const { file, uuid } = fileElement;

  formData.append('file', file);

  const throttledUpdate = throttle((progressEvent: any): void => {
    const streaming_value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    store.dispatch(updateFileDetail({ uuid, streaming_value }));
  }, 1000);
  // OPTIMIZATION -> I would use resumable.js with petl to send file in chunck. But, that require additinal logic on
  // progress bar,
  const config = {
    onUploadProgress: throttledUpdate,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await api.post(`/api/_internal/upload_csv/`, formData, config);

  return data;
}
