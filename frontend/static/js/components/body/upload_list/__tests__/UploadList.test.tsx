import React from 'react';
import { render, screen, waitFor } from '../../../../utils/testing-utils';
import UploadList from '../UploadList';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { FetchUploadListResponse } from '../../../../api/types';
import { EnrichDetailStatus } from '../../../../api/enums';

const uploadList = {
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

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(uploadList)),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('UploadList', () => {
  test.each([
    ['response with data', true],
    ['response without data', false],
  ])('Default render all components > %s', async (_, dataProvided: boolean) => {
    if (!dataProvided) {
      server.use(
        rest.get('/api/_internal/csv_list', (req, res, ctx) => {
          return res.once(
            ctx.json({
              result: [],
              paginator: {
                total_pages: 1,
                page: 1,
                page_size: 10,
              },
            }),
          );
        }),
      );
    }

    render(<UploadList />);

    // check if all required components are rendered -> spinner should be included
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('sorting')).toBeInTheDocument();
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByTestId('upload-list')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryAllByTestId('table-row')).toHaveLength(0);

    // data fetched
    if (dataProvided) {
      await waitFor(() => {
        expect(screen.queryAllByTestId('table-row')).toHaveLength(5);
        expect(screen.getByTestId('page-size-dropdown')).toBeInTheDocument();
      });
    } else {
      await waitFor(() => {
        expect(screen.getByTestId('table-table-rows')).toBeInTheDocument();
      });
      expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
    }

    // spinner should not be visible after data fetch
    expect(screen.queryAllByTestId('spinner')).toHaveLength(0);
  });

  test.each([
    ['with paginator', true],
    ['without paginator', false],
  ])('Default render > %s', async (_, showPaginator: boolean) => {
    if (showPaginator) {
      server.use(
        rest.get('/api/_internal/csv_list', (req, res, ctx) => {
          return res.once(
            ctx.json({
              result: [], // not important for this test
              paginator: {
                total_pages: 10,
                page: 1,
                page_size: 10,
              },
            }),
          );
        }),
      );
    }

    render(<UploadList />);
    // spinner when fetching data
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // data fetching
    await waitFor(() => {
      expect(screen.queryAllByTestId('spinner')).toHaveLength(0);
    });

    if (showPaginator) {
      expect(screen.getByTestId('paginator')).toBeInTheDocument();
    } else {
      expect(screen.queryAllByTestId('paginator')).toHaveLength(0);
    }
  });
});
