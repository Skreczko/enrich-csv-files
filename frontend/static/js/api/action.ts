import axios from 'axios';

const api = axios.create();

export async function upload_csv(file: File): Promise<any> {
  const formData = new FormData();

  formData.append('file', file);

  const config = {
    onUploadProgress: function (progressEvent: any): void {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(file.name, percentCompleted);
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const { data } = await api.post(`/api/_internal/upload_csv/`, formData, config);

  return data;
}
