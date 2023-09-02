import axios from 'axios';
import { FileType } from '../components/body/upload/UploadFile';
import { updateFileDetail } from '../redux/FileDetailsManagementSlice';
import { throttle } from 'lodash';
import { store } from '../redux/store';

const api = axios.create();

export async function uploadFile(fileElement: FileType): Promise<{ name: string }> {
  const formData = new FormData();
  const { file, uuid } = fileElement;

  formData.append('file', file);

  const throttledUpdate = throttle((progressEvent: any): void => {
    const streaming_value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    store.dispatch(updateFileDetail({ uuid, streaming_value }));
  }, 1000);

  // OPTIMIZATION -> I would use resumable.js with petl to send file in chunk. But, that require additional logic. Check EXPLAIN_CODE.md

  const config = {
    onUploadProgress: throttledUpdate,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await api.post(`/api/_internal/csv_upload`, formData, config);

  return data;
}
