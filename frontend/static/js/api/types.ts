import { CeleryTaskStatus, EnrichDetailStatus, SortList } from './enums';

export const pageSizeType = 20 | 50 | 100;

export enum EnrichmentJoinType {
  LEFT = 'left',
  RIGHT = 'right',
  INNER = 'inner',
}

type EnrichDetail = {
  external_url: string;
  // Optional parameters are populated upon receiving a response from the instance details endpoint.
  created?: string;
  external_elements_count?: number;
  external_elements_key_list?: string[];
  external_response?: FileDetail;
  is_flat?: boolean;
  join_type?: EnrichmentJoinType;
  json_root_path?: string;
  selected_header?: string;
  selected_key?: string;
  uuid?: string;
};

export type FileDetail = {
  size: number;
  url: string;
};

export type CsvFileElement = {
  // Matches the structure of backend's csv_list.py::csv_list.serialize_queryset.fields
  created: string;
  enrich_detail: EnrichDetail;
  original_file_name: string;
  source_original_file_name: string;
  source_uuid: string;
  status: EnrichDetailStatus;
  uuid: string;
  // Used exclusively for frontend optimization to prevent redundant backend requests each time instance details are accessed.
  fetchedDetailInfo: boolean;
  // Optional parameters are populated upon receiving a response from the instance details endpoint.
  file?: FileDetail;
  file_headers?: string[];
  file_row_count?: number;
  source_instance?: CsvFileElement;
};

export type PaginatorType = {
  page: number;
  page_size: typeof pageSizeType;
  total_pages: number;
};

export type FetchUploadListRequest = {
  // Matches the structure of backend's CSVListFileRequestForm
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: typeof pageSizeType;
  search?: string;
  sort?: SortList;
};

export type EnrichFileRequest = {
  enrichDetailUuid: string;
  flattenJson: boolean;
  selectedCsvHeader: string;
  selectedJoinType: EnrichmentJoinType;
  selectedJsonKey: string;
};

export type FetchUploadListResponse = {
  // Matches the structure of backend's csv_list.csv_list response
  result: CsvFileElement[];
  paginator: PaginatorType;
};

export type FetchChunkDataResponse = {
  // Matches the structure of backend's  csv_preview_chunks_get.csv_preview_chunks_get response
  chunk_number: number; //starts from 0
  chunk_size: number;
  headers: string[];
  rows: any[][];
  uuid: string;
};

export enum StatusFilter {
  IN_PROGRESS = 'in_progress',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export enum FileTypeFilter {
  SOURCE = 'source',
  ENRICHED = 'enriched',
}

export type FileListFilters = {
  status: StatusFilter;
  file_type: FileTypeFilter;
  date_from: string;
  date_to: string;
};

export type FailureTaskResult = {
  error: string;
};
export type TaskResultPending = {
  status: CeleryTaskStatus.PENDING;
  results: null;
};
export type TaskResultSuccess = {
  status: CeleryTaskStatus.SUCCESS;
  results: CsvFileElement;
};
export type TaskResultFailure = {
  status: CeleryTaskStatus.FAILURE;
  results: FailureTaskResult;
};
export type TaskResult = TaskResultSuccess | TaskResultPending | TaskResultFailure;
