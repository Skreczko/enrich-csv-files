export enum ApiAction {
  FETCH_UPLOAD_LIST = 'csv_list',
}

export enum SortList {
  // Matches the structure of backend's CsvListSortColumn
  CREATED_ASC = 'created',
  CREATED_DESC = '-created',
}

export enum EnrichDetailStatus {
  // Matches the structure of backend's EnrichmentStatus
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  FAILED = 'failed',
  INITIATED = 'initiated',
}
