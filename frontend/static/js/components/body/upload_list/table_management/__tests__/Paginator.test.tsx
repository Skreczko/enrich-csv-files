import React from 'react';
import { fireEvent, render, screen, waitFor } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
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
afterAll(() => server.close());

describe('Paginator', () => {
  let store: any;
  const initialState = {
    page: 1,
    page_size: 10,
    total_pages: 18,
  };

  beforeEach(() => {
    const rendered = render(<Paginator />, [setPaginator(initialState)]);
    store = rendered.store;
  });

  test('renders correctly', () => {
    expect(screen.getByTestId('paginator')).toBeInTheDocument();
    expect(screen.getByText('previous')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('next')).toBeInTheDocument();
    expect(store.getState().fileList.paginator).toEqual(initialState);
  });

  test('handles "next" button click', async () => {
    const nextButton = screen.getByText('next');

    // Simulate clicking next
    fireEvent.click(nextButton);

    // Validate that the state reflects the action of clicking "next"
    await waitFor(() => {
      expect(store.getState().fileList.paginator).toEqual({
        ...initialState,
        page: 2,
      });
    });
  });
});
