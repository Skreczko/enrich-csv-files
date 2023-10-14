import React from 'react';
import { fireEvent, render, screen, waitFor } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { advanceTo } from 'jest-date-mock';
import { SearchInput } from '../SearchInput';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    const search = req.url.searchParams.get('search');
    if (search.length) {
      if (search === '9e3cde12-5ca6-4516-8e0d-6d2b6ec3bb5a') {
        return res(
          ctx.status(200),
          ctx.json({
            ...basicUploadList,
            result: [basicUploadList.result[0]],
          }),
        );
      } else {
        return res(
          ctx.status(200),
          ctx.json({
            ...basicUploadList,
            result: [],
          }),
        );
      }
    }

    return res(ctx.status(200), ctx.json(basicUploadList));
  }),
);

beforeAll(() => {
  process.env.TEST_ENV = 'true';
  server.listen({ onUnhandledRequest: 'error' });
});
beforeEach(() => {
  advanceTo(new Date(Date.UTC(2023, 9, 29, 12, 0, 0)));
});
afterAll(() => {
  process.env.TEST_ENV = undefined;
  server.close();
});

describe('SearchInput', () => {
  test('Default render', async () => {
    const { store } = render(<SearchInput />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    const searchInput = screen.getByTestId('search-input-input');
    expect(searchInput).toBeInTheDocument();

    // Initial state check
    expect(store.getState().fileListParam.search).toEqual('');

    // Simulate typing in the search input
    const correctText = '9e3cde12-5ca6-4516-8e0d-6d2b6ec3bb5a';

    fireEvent.change(searchInput, { target: { value: correctText } });

    // Validate that the state reflects the action of typing in the search input
    await waitFor(() => {
      expect(store.getState().fileListParam.search).toEqual(correctText);
      expect(store.getState().fileList.fileList).toEqual([
        { ...basicUploadList.result[0], fetchedDetailInfo: false },
      ]);
    });

    // Simulate random text typing in the search input
    const incorrectText = 'random_value';
    fireEvent.change(searchInput, { target: { value: incorrectText } });

    // Validate that the state reflects the action of typing in the search input
    await waitFor(() => {
      expect(store.getState().fileListParam.search).toEqual(incorrectText);
      expect(store.getState().fileList.fileList).toEqual([]);
    });
  });
});
