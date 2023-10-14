import React from 'react';
import { fireEvent, render, screen, waitFor } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { advanceTo } from 'jest-date-mock';
import { Paginator } from '../Paginator';
import { setPaginator } from '../../../../../redux/FileListSlice';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    const page = req.url.searchParams.get('page');
    if (page === '2') {
      return res(
        ctx.status(200),
        ctx.json({
          ...basicUploadList,
          paginator: {
            total_pages: 18,
            page: 2,
            page_size: 10,
          },
        }),
      );
    }
    return res(
      ctx.status(200),
      ctx.json({
        ...basicUploadList,
        paginator: {
          ...basicUploadList.paginator,
          total_pages: 18,
        },
      }),
    );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  advanceTo(new Date(Date.UTC(2023, 9, 29, 12, 0, 0)));
});
afterAll(() => server.close());

describe('Paginator', () => {
  test('Default render and next button functionality', async () => {
    const { store } = render(<Paginator />, [
      setPaginator({
        ...basicUploadList.paginator,
        total_pages: 18,
      }),
    ]);

    expect(screen.getByTestId('paginator')).toBeInTheDocument();
    expect(screen.getByText('previous')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    const nextButton = screen.getByText('next');
    expect(nextButton).toBeInTheDocument();

    // Initial paginator state check
    expect(store.getState().fileList.paginator).toEqual({
      page: 1,
      page_size: 10,
      total_pages: 18,
    });

    // Simulate clicking next
    fireEvent.click(nextButton);

    // Validate that the state reflects the action of clicking "next"
    await waitFor(() => {
      expect(store.getState().fileList.paginator).toEqual({
        page: 2,
        page_size: 10,
        total_pages: 18,
      });
    });
  });
});
