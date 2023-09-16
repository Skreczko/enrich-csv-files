import axios from 'axios';
import { mapKeys, snakeCase, throttle } from 'lodash';
import { store } from '../redux/store';
import { updateFileDetail } from '../redux/UploadSectionSlice';
import { ApiRequest, CsvFileElement, FetchUploadListResponse } from './types';
import { FileType } from '../components/body/upload/types';

const convertKeysToSnakeCase = (obj: any): any =>
  mapKeys(obj, (_value: any, key: any) => snakeCase(key));

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const api = axios.create(config);

export async function uploadFile(fileElement: FileType): Promise<{ original_file_name: string }> {
  const formData = new FormData();
  const { file, uuid } = fileElement;

  formData.append('file', file);

  const throttledUpdate = throttle((progressEvent: any): void => {
    const streaming_value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    store.dispatch(updateFileDetail({ uuid, streaming_value }));
  }, 1000);

  // OPTIMIZATION -> I would use resumable.js with petl to send file in chunk. But, that require additional logic. Check EXPLAIN_CODE.md

  const customConfig = {
    ...config,
    onUploadProgress: throttledUpdate,
  };

  const { data } = await api.post(`/api/_internal/csv_upload`, formData, customConfig);

  return data;
}

export async function fetchUploadList(request: ApiRequest): Promise<FetchUploadListResponse> {
  /**
   * Fetches the upload list.
   *
   * Note: The response is modified to include a "fetchedDetailInfo" field for frontend purposes.
   * This field indicates whether the element has been fetched using the list endpoint.
   *
   * @param request The API request.
   * @returns The response with additional frontend-specific field.
   */

  const { action, ...request_data } = request;

  const queryParams = new URLSearchParams(convertKeysToSnakeCase(request_data)).toString();

  const { data } = await api.get(`/api/_internal/${action}?${queryParams}`);
  return {
    ...data,
    result: data.result.map(
      (element: Omit<CsvFileElement, 'fetchedDetailInfo'>): CsvFileElement => ({
        ...element,
        fetchedDetailInfo: false,
      }),
    ),
  };
}

export async function deleteUploadFile(uuid: string): Promise<{ csvfile_uuid: string }> {
  const formData = new FormData();

  formData.append('uuid', uuid);
  const { data } = await api.post(`/api/_internal/csv_delete`, formData);

  return data;
}
