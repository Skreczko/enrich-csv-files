import React from 'react';
import { render, screen, waitFor } from '../../../../utils/testing-utils';
import UploadList from '../UploadList';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { FetchUploadListResponse } from '../../../../api/types';

const uploadList = {
  result: [
    {
      created: '2023-10-11T11:16:05.568Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: 'users_posts_audience.csv_enriched.csv',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '53cc712f-e4f7-4d58-b1c3-9c562184d491',
      status: 'completed',
      uuid: 'f7c45ed2-7875-4a3a-b804-3d2f7e1b0b96',
    },
    {
      created: '2023-10-11T11:16:00.596Z',
      enrich_detail: null,
      original_file_name: 'users_posts_audience.csv',
      source_original_file_name: null,
      source_uuid: null,
      status: 'completed',
      uuid: '53cc712f-e4f7-4d58-b1c3-9c562184d491',
    },
    {
      created: '2023-10-11T11:15:37.471Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: '',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '03ed8432-b89b-485e-a8f2-08c298bc6f06',
      status: 'enriching',
      uuid: '3116c802-724d-4122-bedd-fa7f83c48a75',
    },
    {
      created: '2023-10-10T20:46:45.845Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: '',
      source_original_file_name: 'users_posts_audience.csv',
      source_uuid: '75898f67-5504-497e-9484-4fff2b20d9ba',
      status: 'enriching',
      uuid: '91892ff8-485e-4c61-a81c-e71e57e8a313',
    },
    {
      created: '2023-10-10T20:46:33.764Z',
      enrich_detail: null,
      original_file_name: 'users_posts_audience.csv',
      source_original_file_name: null,
      source_uuid: null,
      status: 'completed',
      uuid: '75898f67-5504-497e-9484-4fff2b20d9ba',
    },
    {
      created: '2023-10-10T20:45:52.703Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: '',
      source_original_file_name:
        '22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222 (copy).csv',
      source_uuid: '4522bb46-fdcf-4b3d-a0b7-880b011ca2a2',
      status: 'enriching',
      uuid: 'f5225a27-5557-4498-a008-7b16cb84b548',
    },
    {
      created: '2023-10-10T20:45:00.171Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: '',
      source_original_file_name: 'csv_header.csv',
      source_uuid: '96546d7f-fb79-4b32-a912-a2fbf703d219',
      status: 'enriching',
      uuid: '9af6a9d1-66dc-40d1-b04b-ededd60a0930',
    },
    {
      created: '2023-10-10T18:47:43.651Z',
      enrich_detail: {
        external_url: 'https://github.com/joannaB2/star-wars/blob/master/src/hooks/useGetPlanet.ts',
      },
      original_file_name: '',
      source_original_file_name: 'csv_header.csv_enriched.csv',
      source_uuid: '9de5f664-72b0-45fd-9c21-c7ac0290c167',
      status: 'fetching_response',
      uuid: '0277e902-e931-4181-bf85-739287353551',
    },
    {
      created: '2023-10-10T14:38:02.356Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: '',
      source_original_file_name: 'csv_header.csv',
      source_uuid: '96546d7f-fb79-4b32-a912-a2fbf703d219',
      status: 'fetching_response',
      uuid: '35278756-63c4-4dd1-8cea-dfbfdf9b9b11',
    },
    {
      created: '2023-10-10T12:57:45.822Z',
      enrich_detail: {
        external_url: 'https://jsonplaceholder.typicode.com/users',
      },
      original_file_name: 'csv_header.csv_enriched.csv',
      source_original_file_name: 'csv_header.csv',
      source_uuid: '96546d7f-fb79-4b32-a912-a2fbf703d219',
      status: 'completed',
      uuid: '9de5f664-72b0-45fd-9c21-c7ac0290c167',
    },
  ],
  paginator: {
    total_pages: 4,
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
afterEach(() => {});
afterAll(() => server.close());

describe('UploadList', () => {
  test.each([
    ['response with data', true],
    ['response without data', false],
  ])('Default render > %s', async (_, dataProvided: boolean) => {
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
    // spinner when fetching data
    expect(screen.getByTestId('upload-list')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryAllByTestId('table-row')).toHaveLength(0);

    // data fetched
    if (dataProvided) {
      await waitFor(() => {
        expect(screen.queryAllByTestId('table-row')).toHaveLength(10);
      });
    } else {
      await waitFor(() => {
        expect(screen.getByTestId('table-table-rows')).toBeInTheDocument();
      });
      expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
    }
    expect(screen.queryAllByTestId('spinner')).toHaveLength(0);
  });
});
