import axios from 'axios';
import { mapKeys, snakeCase, throttle } from 'lodash';
import { store } from '../redux/store';
import { updateFileDetail } from '../redux/UploadSectionSlice';
import {
  CsvFileElement,
  FetchChunkDataResponse,
  EnrichFileRequest,
  FetchUploadListRequest,
  FetchUploadListResponse,
  TaskResult,
  FetchChunkDataParamRequest,
} from './types';
import { FileType } from '../components/body/upload_csv/types';

const convertKeysToSnakeCase = (obj: any): any =>
  mapKeys(obj, (_value: any, key: any) => snakeCase(key));

const config = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const api = axios.create(config);

export async function fetchTaskResults(taskIds: string[]): Promise<Record<string, TaskResult>> {
  try {
    const { data } = await api.post('/api/_internal/fetch_task_results', {
      task_ids: JSON.stringify(taskIds),
    });
    return data;
  } catch (error) {
    return Promise.resolve({});
  }
}

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

export async function fetchUploadList(
  params: FetchUploadListRequest,
): Promise<FetchUploadListResponse> {
  /**
   * Fetches the upload list.
   *
   * Note: The response is modified to include a "fetchedDetailInfo" field for frontend purposes.
   * This field indicates whether the element has been fetched using the list endpoint.
   *
   */

  const queryParams = new URLSearchParams(convertKeysToSnakeCase(params)).toString();

  const { data } = await api.get(`/api/_internal/csv_list?${queryParams}`);
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

export async function fetchUploadDetails(uuid: string): Promise<CsvFileElement> {
  /**
   * Fetches the upload details.
   *
   * Note: The response is modified to include a "fetchedDetailInfo" field for frontend purposes.
   * This field indicates whether the element has been fetched using the list endpoint.
   *
   */

  const { data } = await api.get(`/api/_internal/csv_list/${uuid}`);
  return {
    ...data,
    fetchedDetailInfo: true,
  };
}

export async function deleteUploadFile(uuid: string): Promise<{ csvfile_uuid: string }> {
  const { data } = await api.post(`/api/_internal/csv_delete`, { uuid });

  return data;
}

export async function fetchExternalUrlJson(
  uuid: string,
  enrichUrl: string,
  jsonRootPath: string,
): Promise<{ task_id: string; csv_file_uuid: string }> {
  const { data } = await api.post(`/api/_internal/csv_list/${uuid}/enrich_detail_create`, {
    external_url: enrichUrl,
    json_root_path: jsonRootPath,
  });
  return data;
}
export async function enrichFile({
  enrichDetailUuid,
  flattenJson,
  selectedCsvHeader,
  selectedJoinType,
  selectedJsonKey,
}: EnrichFileRequest): Promise<{ task_id: string; csv_file_uuid: string }> {
  /**
   * Endpoint to initiate the enrichment of a CSV file using data from an external URL.
   *
   * return: JsonResponse object containing the ID of the scheduled task.
   *
   */

  const { data } = await api.post(`/api/_internal/enrich_file_create`, {
    enrich_detail_uuid: enrichDetailUuid,
    selected_merge_key: selectedJsonKey,
    selected_merge_header: selectedCsvHeader,
    join_type: selectedJoinType,
    is_flat: flattenJson,
  });
  return data;
}

export async function fetchChunkData(
  uuid: string,
  params: FetchChunkDataParamRequest,
): Promise<FetchChunkDataResponse> {
  const queryParams = new URLSearchParams(convertKeysToSnakeCase(params)).toString();

  const { data } = await api.get(
    `/api/_internal/csv_list/${uuid}/read_preview_chunk?${queryParams}`,
  );
  return data;
}
