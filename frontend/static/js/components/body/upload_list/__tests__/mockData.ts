import { EnrichDetailStatus } from '../../../../api/enums';
import { FetchUploadListResponse } from '../../../../api/types';

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
      uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263',
    },
  ],
  paginator: {
    total_pages: 1,
    page: 1,
    page_size: 10,
  },
} as FetchUploadListResponse;
