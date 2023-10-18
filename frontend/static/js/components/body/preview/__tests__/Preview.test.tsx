import React, { ReactNode } from 'react';
import { render, screen, waitFor } from '../../../../utils/testing-utils';

import Preview from '../Preview';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { fileHeaders, selectedCsvFileSourceUuid } from '../../../../utils/mockData';

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: jest.fn().mockReturnValue({ uuid: '0e1294fe-8bbc-42ef-ab24-c2c2515eb263' }),
  };
});

// mocking AutoSizer
jest.mock('react-virtualized-auto-sizer', () => {
  return function MockAutoSizer({
    children,
  }: {
    children: (size: { height: number; width: number }) => ReactNode;
  }): ReactNode {
    return children({ height: 970, width: 1000 });
  };
});

const generateRows = (count: number, startFrom = 0): string[][] => {
  return Array.from({ length: count }, (_, i) => [
    `impression_id value: ${i + startFrom}`,
    `impression_city value: ${i + startFrom}`,
    `posting_user_id value: ${i + startFrom}`,
    `post_id value: ${i + startFrom}`,
    `viewer_email value: ${i + startFrom}`,
    `impression_country value: ${i + startFrom}`,
    `timestamp value: ${i + startFrom}`,
    `device value: ${i + startFrom}`,
  ]);
};

const server = setupServer(
  rest.get(
    `/api/_internal/csv_list/${selectedCsvFileSourceUuid}/read_preview_chunk`,
    (req, res, ctx) => {
      const chunkNumber = req.url.searchParams.get('chunk_number');
      const defaultChunkSize = 200;
      const response = {
        chunk_number: 0,
        chunk_size: defaultChunkSize,
        headers: fileHeaders,
        total_rows: 1000,
        uuid: selectedCsvFileSourceUuid,
      };
      return res(
        ctx.status(200),
        ctx.json({
          ...response,
          rows: generateRows(defaultChunkSize, Number(chunkNumber) * defaultChunkSize),
        }),
      );
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Preview', () => {
  test('Default render', async () => {
    const { store } = render(<Preview />);

    // fetching chunk data - show spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(store.getState().previewList).toEqual({});

    await waitFor(() => {
      expect(screen.getByTestId('preview')).toBeInTheDocument();
      expect(store.getState().previewList).toEqual({
        [selectedCsvFileSourceUuid]: {
          chunkSize: 200,
          headers: fileHeaders,
          lastChunkNumber: 0,
          rows: generateRows(200),
          totalRows: 1000,
        },
      });
    });

    // spinner should not be visible
    expect(screen.queryAllByTestId('spinner')).toHaveLength(0);
  });
});
