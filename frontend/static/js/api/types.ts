// used Discriminated Union pattern
import { ApiAction, EnrichDetailStatus, SortList } from './enums';

export const pageSizeType = 20 | 50 | 100;

type EnrichDetail = {
  created: string;
  external_elements_key_list: string[];
  external_url: string;
  id: number;
};

type FileDetail = {
  size: number;
  url: string;
};

export type CsvFileElement = {
  // Matches the structure of backend's csv_list.py::csv_list.serialize_queryset.fields
  created: string;
  enrich_detail: EnrichDetail;
  file: FileDetail;
  file_headers: string[];
  file_row_count: number;
  original_file_name: string;
  source_original_file_name: string;
  source_uuid: string;
  status: EnrichDetailStatus;
  uuid: string;
};

export type PaginatorType = {
  page: number;
  page_size: typeof pageSizeType;
  total_pages: number;
};

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

export type FetchUploadListResponse = {
  // Matches the structure of backend's  TODO
  result: CsvFileElement[];
  paginator: PaginatorType;
};

export type ApiRequest = FetchUploadListRequest;
