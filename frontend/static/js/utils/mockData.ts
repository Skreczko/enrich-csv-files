import { EnrichDetailStatus } from '../api/enums';
import { CsvFileElement, FetchUploadListResponse } from '../api/types';

const selectedCsvFileSourceUuid = '0e1294fe-8bbc-42ef-ab24-c2c2515eb263';
export const selectedCsvFileUuid = '3947b72a-d907-44aa-92c2-6ce44813e230';
const selectedEnrichDetailUuid = '65869971-86db-4ccd-8454-44c9add10847';

// csv element enriched with external url. fetchedDetailInfo is false
// used as default for list view
export const csvElementDetailNotFetched = {
  created: '2023-10-14T23:31:37.243Z',
  enrich_detail: {
    external_url: 'https://example.com',
  },
  original_file_name: 'users_posts_audience.csv_enriched.csv',
  source_original_file_name: 'users_posts_audience.csv',
  source_uuid: selectedCsvFileSourceUuid,
  status: EnrichDetailStatus.COMPLETED,
  uuid: selectedCsvFileUuid,
  fetchedDetailInfo: false,
} as CsvFileElement;

// csv element used in 1 step of enriching process. enrich_detail not created yet. fetchedDetailInfo is false
export const csvElementDetailEnrichStep1 = {
  created: '2023-10-12T14:50:44.629Z',
  enrich_detail: null,
  original_file_name: 'users_posts_audience.csv',
  source_original_file_name: null,
  source_uuid: null,
  status: EnrichDetailStatus.COMPLETED,
  uuid: '906908bb-32c6-43dc-9694-03dca063ca12',
  fetchedDetailInfo: false,
} as CsvFileElement;

// csv element used in 2 step of enriching process. enrich_detail created. fetchedDetailInfo is true
export const csvElementDetailEnrichStep2 = {
  created: '2023-10-17T00:19:39.808Z',
  enrich_detail: {
    created: '2023-10-17T00:19:39.810Z',
    external_elements_count: 10,
    external_elements_key_list: [
      'id',
      'name',
      'username',
      'email',
      'address',
      'phone',
      'website',
      'company',
    ],
    external_response: {
      url: '/media/files/no_user/cad371ad-5bd6-44b0-bcb8-b295cca33f21.json',
      size: 5645,
    },
    external_url: 'https://example.com',
    is_flat: false,
    join_type: null,
    json_root_path: '',
    selected_header: '',
    selected_key: '',
    uuid: 'cad371ad-5bd6-44b0-bcb8-b295cca33f21',
  },
  file: null,
  file_headers: null,
  file_row_count: null,
  original_file_name: '',
  source_original_file_name: 'users_posts_audience.csv',
  source_uuid: selectedCsvFileSourceUuid,
  status: EnrichDetailStatus.AWAITING_COLUMN_SELECTION,
  uuid: '55519f2a-153f-4c5d-8fe3-87dc11fb30a9',
  source_instance: {
    created: '2023-10-12T14:07:01.454Z',
    uuid: selectedCsvFileSourceUuid,
    original_file_name: 'users_posts_audience.csv',
    file: {
      url: `/media/files/no_user/${selectedCsvFileSourceUuid}.csv`,
      size: 146445,
    },
    file_row_count: 1000,
    file_headers: [
      'impression_id',
      'impression_city',
      'posting_user_id',
      'post_id',
      'viewer_email',
      'impression_country',
      'timestamp',
      'device',
    ],
  },
  fetchedDetailInfo: true,
} as CsvFileElement;

// csv element after enriching process. enrich_detail created. fetchedDetailInfo is true
export const csvElementDetailFetched = {
  created: '2023-10-14T23:31:37.243Z',
  enrich_detail: {
    created: '2023-10-14T23:31:37.245Z',
    external_elements_count: 10,
    external_elements_key_list: [
      'id',
      'name',
      'username',
      'email',
      'address',
      'phone',
      'website',
      'company',
    ],
    external_response: {
      url: `/media/files/no_user/${selectedEnrichDetailUuid}.json`,
      size: 5645,
    },
    external_url: 'https://example.com',
    is_flat: true,
    join_type: 'left',
    json_root_path: '',
    selected_header: 'post_id',
    selected_key: 'id',
    uuid: selectedEnrichDetailUuid,
  },
  file: {
    url: `/media/home/user/media/files/no_user/${selectedCsvFileUuid}.csv`,
    size: 178469,
  },
  file_headers: [
    'impression_id',
    'impression_city',
    'posting_user_id',
    'post_id',
    'viewer_email',
    'impression_country',
    'timestamp',
    'device',
    'name',
    'username',
    'email',
    'address_street',
    'address_suite',
    'address_city',
    'address_zipcode',
    'address_geo_lat',
    'address_geo_lng',
    'phone',
    'website',
    'company_name',
    'company_catchPhrase',
    'company_bs',
  ],
  file_row_count: 1000,
  original_file_name: 'users_posts_audience.csv_enriched.csv',
  source_original_file_name: 'users_posts_audience.csv',
  source_uuid: selectedCsvFileSourceUuid,
  status: 'completed',
  uuid: selectedCsvFileUuid,
  source_instance: {
    created: '2023-10-12T14:50:44.629Z',
    uuid: selectedCsvFileSourceUuid,
    original_file_name: 'users_posts_audience.csv',
    file: {
      url: `/media/files/no_user/${selectedCsvFileSourceUuid}.csv`,
      size: 146445,
    },
    file_row_count: 1000,
    file_headers: [
      'impression_id',
      'impression_city',
      'posting_user_id',
      'post_id',
      'viewer_email',
      'impression_country',
      'timestamp',
      'device',
    ],
  },
  fetchedDetailInfo: true,
} as CsvFileElement;

// base upload list used in list view
export const basicUploadList = {
  result: [
    {
      created: '2023-10-12T14:07:35.536Z',
      enrich_detail: {
        external_url: 'https://example.com',
      },
      original_file_name: '',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263',
      status: EnrichDetailStatus.FAILED_FETCHING_RESPONSE_NOT_JSON,
      uuid: '9e3cde12-5ca6-4516-8e0d-6d2b6ec3bb5a',
    },
    {
      created: '2023-10-12T14:07:35.536Z',
      enrich_detail: {
        external_url: 'https://example.com',
      },
      original_file_name: '',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263',
      status: EnrichDetailStatus.FAILED_ENRICHING,
      uuid: '8df31f80-82c3-4786-b6c6-2138de4df8c5',
    },
    {
      created: '2023-10-12T14:07:45.411Z',
      enrich_detail: {
        external_url: 'https://example.com',
      },
      original_file_name: 'users_posts_audience.csv_enriched.csv',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263',
      status: EnrichDetailStatus.COMPLETED,
      uuid: '316f53a2-61d9-4b9c-9010-718dd97a403d',
    },
    {
      created: '2023-10-12T14:07:35.536Z',
      enrich_detail: {
        external_url: 'https://example.com',
      },
      original_file_name: '',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263',
      status: EnrichDetailStatus.AWAITING_COLUMN_SELECTION,
      uuid: 'e2c91c35-ad99-43b4-81ee-b9be9e6ef664',
    },
    {
      created: '2023-10-12T14:07:01.454Z',
      enrich_detail: null,
      original_file_name: 'users_posts_audience.csv',
      source_original_file_name: null,
      source_uuid: null,
      status: EnrichDetailStatus.COMPLETED,
      uuid: selectedCsvFileSourceUuid,
    },
  ],
  paginator: {
    total_pages: 1,
    page: 1,
    page_size: 10,
  },
} as FetchUploadListResponse;
