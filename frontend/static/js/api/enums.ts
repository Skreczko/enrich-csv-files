export enum ApiAction {
  FETCH_UPLOAD_LIST = 'csv_list',
}

export enum SortList {
  // Matches the structure of backend's CsvListSortColumn
  CREATED_ASC = 'created',
  CREATED_DESC = '-created',
  ORIGINAL_FILE_NAME_ASC = 'original_file_name',
  ORIGINAL_FILE_NAME_DESC = '-original_file_name',
  STATUS_ASC = 'status',
  STATUS_DESC = '-status',
  SOURCE_ORIGINAL_FILE_NAME_ASC = 'source_original_file_name',
  SOURCE_ORIGINAL_FILE_NAME_DESC = '-source_original_file_name',
  ENRICH_URL_ASC = 'enrich_url',
  ENRICH_URL_DESC = '-enrich_url',
}

export enum EnrichDetailStatus {
  // Matches the structure of backend's EnrichmentStatus

  // fetching api response section
  FETCHING_RESPONSE = 'fetching_response',
  FAILED_FETCHING_RESPONSE = 'failed_fetching_response',
  FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS = 'failed_fetching_response_incorrect_url_status',
  FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION = 'failed_fetching_response_other_request_exception',
  FAILED_FETCHING_RESPONSE_NOT_JSON = 'failed_fetching_response_not_json',
  FAILED_FETCHING_RESPONSE_EMPTY_JSON = 'failed_fetching_response_empty_json',

  // user action section
  AWAITING_COLUMN_SELECTION = 'awaiting_column_selection',
  FAILED_COLUMN_SELECTION = 'failed_column_selection',

  // enriching section
  ENRICHING = 'enriching',
  FAILED_ENRICHING = 'failed_enriching',

  // completed
  COMPLETED = 'completed',
}
