import axios from 'axios';
import { FileType, StreamingDetails } from '../components/body/upload/UploadFile';

const api = axios.create();

interface UploadCsvRequest {
  fileElement: FileType;
  onStreamingValueChange: ({ streaming_value, temp_id }: StreamingDetails) => void;
}

export async function upload_csv({
  fileElement,
  onStreamingValueChange,
}: UploadCsvRequest): Promise<any> {
  const formData = new FormData();

  const { file, temp_id } = fileElement;
  console.log("action", temp_id)

  formData.append('file', file);

  const config = {
    onUploadProgress: function (progressEvent: any): void {
      const streaming_value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onStreamingValueChange({ streaming_value, temp_id });
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await api.post(`/api/_internal/upload_csv/`, formData, config);

  return data;
}
