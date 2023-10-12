import React from 'react';
import { render, screen, waitFor } from '../../../../utils/testing-utils';
import UploadList from '../UploadList';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../utils/mockData';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(basicUploadList)),
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
