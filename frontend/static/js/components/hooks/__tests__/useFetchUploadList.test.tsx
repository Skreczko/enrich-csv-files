import { Provider } from 'react-redux';
import { act, renderHook, RenderResult, WaitForNextUpdate } from '@testing-library/react-hooks';
import { storeReducer } from '../../../redux/store';
import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { useFetchUploadList } from '../useFetchUploadList';
import {
  fileListParamInitialState,
  FileListParamState,
  setParams,
} from '../../../redux/FileListParamSlice';
import { MemoryRouter as Router } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { SortList } from '../../../api/enums';
import { FileTypeFilter, StatusFilter } from '../../../api/types';

// A variable to capture and store the query parameters sent in the HTTP request to the backend.
// It's set during the mock server's request handling and checked in tests to validate the sent parameters.
let queryParams = '';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    queryParams = req.url.searchParams.toString();
    return res(
      ctx.status(200),
      ctx.json({
        result: [], // not important for this test
        paginator: {
          total_pages: 1,
          page: 1,
          page_size: 10,
        },
      }),
    );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const prepareRenderHook = (): {
  store: ToolkitStore<any, any, [ThunkMiddleware<any, AnyAction, undefined>]>;
  result: RenderResult<(updateParams?: Partial<FileListParamState>) => Promise<void>>;
  waitForNextUpdate: WaitForNextUpdate;
} => {
  const store = configureStore({
    reducer: storeReducer,
  });

  const { result, waitForNextUpdate } = renderHook<
    {},
    (updateParams?: Partial<FileListParamState>) => Promise<void>
  >(() => useFetchUploadList(), {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <Router>{children}</Router>
      </Provider>
    ),
  });
  return { store, result, waitForNextUpdate };
};

describe('useFetchUploadList', () => {
  beforeEach(() => {
    // Reset the query parameters and mock search parameters before each test.
    queryParams = '';
  });

  test.each([
    [
      'initial params',
      fileListParamInitialState,
      'search=&page=1&sort=-created&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed search',
      { ...fileListParamInitialState, search: 'MODIFIED' },
      'search=MODIFIED&page=1&sort=-created&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed sort',
      { ...fileListParamInitialState, sort: SortList.STATUS_ASC },
      'search=&page=1&sort=status&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed page',
      { ...fileListParamInitialState, page: 199 },
      'search=&page=199&sort=-created&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed page size',
      { ...fileListParamInitialState, page_size: 50 },
      'search=&page=1&sort=-created&page_size=50&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed filter status',
      {
        ...fileListParamInitialState,
        filters: { ...fileListParamInitialState.filters, status: StatusFilter.FAILED },
      },
      'search=&page=1&sort=-created&page_size=20&filter_status=failed&filter_file_type=null&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed filter file type',
      {
        ...fileListParamInitialState,
        filters: { ...fileListParamInitialState.filters, file_type: FileTypeFilter.ENRICHED },
      },
      'search=&page=1&sort=-created&page_size=20&filter_status=null&filter_file_type=enriched&filter_date_from=null&filter_date_to=null',
    ],
    [
      'changed filter date from',
      {
        ...fileListParamInitialState,
        filters: { ...fileListParamInitialState.filters, date_from: '2023-09-30T22:00:00.000Z' },
      },
      'search=&page=1&sort=-created&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=2023-09-30T22%3A00%3A00.000Z&filter_date_to=null',
    ],
    [
      'changed filter date to',
      {
        ...fileListParamInitialState,
        filters: { ...fileListParamInitialState.filters, date_to: '2023-09-30T22:00:00.000Z' },
      },
      'search=&page=1&sort=-created&page_size=20&filter_status=null&filter_file_type=null&filter_date_from=null&filter_date_to=2023-09-30T22%3A00%3A00.000Z',
    ],
  ])(
    'Run custom hook function with %s',
    async (_, queryParamsData: FileListParamState, requestedQueryParamsInUrl: string) => {
      const { store, result } = prepareRenderHook();

      act(() => {
        // push queryParams to redux as its default behavior
        store.dispatch(setParams(queryParamsData));
      });

      // run custom hook
      act(() => {
        result.current();
      });

      await waitFor(() => {
        // check if fetching process has been finished
        expect(store.getState().fileList.isLoading).toBe(false);
      });

      // check redux state
      expect(store.getState().fileListParam).toEqual(queryParamsData);

      // check url which was requested to fetch data
      expect(queryParams).toEqual(requestedQueryParamsInUrl);
    },
  );
});
