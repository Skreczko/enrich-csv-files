import axios from 'axios';
import { mapKeys, snakeCase, throttle } from 'lodash';
import { store } from '../redux/store';
import { FileType } from '../components/body/upload/UploadFile';
import { updateFileDetail } from '../redux/UploadSectionSlice';

const keysToSnakeTrans = (obj: any): any => mapKeys(obj, (_value: any, key: any) => snakeCase(key));

const api = axios.create();

// used Discriminated Union pattern
export enum ApiAction {
  FETCH_UPLOAD_LIST = 'csv_list',
}

export enum SortList {
  // Matches the structure of backend's CsvListSortColumn
  CREATED_ASC = 'created',
  CREATED_DESC = '-created',
}

const pageSizeType = 20 | 50 | 100;

export type FetchUploadListRequest = {
  // Matches the structure of backend's CSVListFileRequestForm
  action: ApiAction.FETCH_UPLOAD_LIST;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: typeof pageSizeType;
  search?: string;
  sort?: SortList;
};

type ApiRequest = FetchUploadListRequest;

export async function uploadFile(fileElement: FileType): Promise<{ original_file_name: string }> {
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

export async function fetchUploadList(request: ApiRequest): Promise<any> {
  const { action, ...request_data } = request;
  const { data } = await api.post(`/api/_internal/${action}`, keysToSnakeTrans(request_data));
  return data;
}
