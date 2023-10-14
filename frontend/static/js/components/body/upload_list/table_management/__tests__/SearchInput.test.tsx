import React from 'react';
import { fireEvent, render, screen, waitFor } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { SearchInput } from '../SearchInput';
import { CsvFileElement } from '../../../../../api/types';

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
afterAll(() => {
  process.env.TEST_ENV = undefined;
  server.close();
});

describe('SearchInput', () => {
  let searchInput: HTMLElement;
  let store: any;

  // Initial setup for each test.
  beforeEach(() => {
    const rendered = render(<SearchInput />);
    store = rendered.store;
    searchInput = screen.getByTestId('search-input-input');
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
    expect(store.getState().fileListParam.search).toEqual('');
  });

  // Helper function to simulate user search and validate the result.
  const simulateSearchAndCheck = async (
    inputText: string,
    expectedList: CsvFileElement[],
  ): Promise<void> => {
    fireEvent.change(searchInput, { target: { value: inputText } });
    await waitFor(() => {
      expect(store.getState().fileListParam.search).toEqual(inputText);
      expect(store.getState().fileList.fileList).toEqual(expectedList);
    });
  };

  test('Entering a correct search phrase retrieves the expected data', async () => {
    const correctText = '9e3cde12-5ca6-4516-8e0d-6d2b6ec3bb5a';
    await simulateSearchAndCheck(correctText, [
      { ...basicUploadList.result[0], fetchedDetailInfo: false },
    ]);
  });

  test('Entering a random search phrase retrieves an empty list', async () => {
    const incorrectText = 'random_value';
    await simulateSearchAndCheck(incorrectText, []);
  });
});
