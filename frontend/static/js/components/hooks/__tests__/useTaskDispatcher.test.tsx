import { Provider } from 'react-redux';
import { useFetchPreviewChunk, UseFetchPreviewChunkResult } from '../useFetchPreviewChunk';
import { act, renderHook, RenderResult, WaitForNextUpdate } from '@testing-library/react-hooks';
import { storeReducer } from '../../../redux/store';
import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import {
  basicUploadList,
  csvElementDetailEnrichStep1,
  csvElementDetailEnrichStep2,
  csvElementDetailFetched,
  csvElementDetailNotFetched,
  fileHeaders,
  selectedCsvFileSourceUuid,
  selectedCsvFileUuid,
} from '../../../utils/mockData';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { useTaskDispatcher } from '../useTaskDispatcher';
import { setTask } from '../../../redux/TaskListReducer';
import { setFileList, setPaginator } from '../../../redux/FileListSlice';
import { TaskResultFailure, TaskResultPending, TaskResultSuccess } from '../../../api/types';
import { CeleryTaskStatus } from '../../../api/enums';
import { waitFor } from '@testing-library/react';

const taskId = '8f3d2f80-6647-496c-9dab-0123b73f6da6';
let requestCount = 0;

const taskResultFailure: Record<string, TaskResultFailure> = {
  [taskId]: {
    results: {
      error: '[Errno 2] No such file or directory',
    },
    status: CeleryTaskStatus.FAILURE,
  },
};
const taskResultPending: Record<string, TaskResultPending> = {
  [taskId]: {
    results: null,
    status: CeleryTaskStatus.PENDING,
  },
};

const taskResultSuccess: Record<string, TaskResultSuccess> = {
  [taskId]: {
    results: csvElementDetailFetched,
    status: CeleryTaskStatus.SUCCESS,
  },
};

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        ...basicUploadList,
        result: [csvElementDetailEnrichStep1, ...basicUploadList.result],
      }),
    ),
  ),
  rest.get(`/api/_internal/csv_list/${selectedCsvFileUuid}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(csvElementDetailFetched));
  }),
  rest.post('/api/_internal/fetch_task_results', (req, res, ctx) => {
    if (requestCount > 3) {
      return res(ctx.status(200), ctx.json(taskResultSuccess));
    } else {
      requestCount += 1;
      return res(ctx.status(200), ctx.json(taskResultPending));
    }
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const prepareRenderHook = (): {
  store: ToolkitStore<any, any, [ThunkMiddleware<any, AnyAction, undefined>]>;
  result: {
    callCounter: React.MutableRefObject<number>;
    clearTimeoutRef: () => void;
    timeoutTime: () => number;
    timeoutTaskDispatcher: (taskIds: string[]) => void;
  };
  waitForNextUpdate: WaitForNextUpdate;
} => {
  const store = configureStore({
    reducer: storeReducer,
  });

  const { result, waitForNextUpdate } = renderHook<
    {},
    {
      callCounter: React.MutableRefObject<number>;
      clearTimeoutRef: () => void;
      timeoutTime: () => number;
      timeoutTaskDispatcher: (taskIds: string[]) => void;
    }
  >(() => useTaskDispatcher(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return { store, result: result.current, waitForNextUpdate };
};

describe('useTaskDispatcher', () => {
  test('Load more preview chunks when scrolling', async () => {
    const { store, result, waitForNextUpdate } = prepareRenderHook();

    act(() => {
      store.dispatch(setPaginator(basicUploadList.paginator));
      store.dispatch(setFileList([csvElementDetailEnrichStep2, ...basicUploadList.result]));
    });
    act(() => {
      store.dispatch(setTask({ [taskId]: { instance: 'CsvFile', uuid: selectedCsvFileUuid } }));
    });

    result.timeoutTaskDispatcher([taskId]);

    // await waitForNextUpdate({ timeout: 10000 });

    await waitFor(() => {
      expect(store.getState().taskList).not.toEqual({});
    });
    expect(store.getState().fileList.fileList[0]).toEqual({});

    // // at initial run - 200 rows should be fetched
    // const initialDataLength = result.current.foundPreviewDetail.rows.length;
    // expect(result.current.foundPreviewDetail.rows.length).toEqual(initialDataLength);
    // // check redux state
    // expect(store.getState().previewList).toEqual({
    //   [selectedCsvFileSourceUuid]: {
    //     chunkSize: 200,
    //     headers: fileHeaders,
    //     lastChunkNumber: 0,
    //     rows: generateRows(200),
    //     totalRows: 400,
    //   },
    // });
    //
    // // scrolling to reach 80% of total rows - that should trigger fetching another 200 rows (400 total)
    // act(() => {
    //   result.current.handleScrollDebounced({
    //     visibleRowStartIndex: 0.7 * initialDataLength,
    //     visibleRowStopIndex: 0.8 * initialDataLength,
    //   });
    // });
    //
    // await waitForNextUpdate();
    //
    // const secondFetchDataLength = 400;
    // expect(result.current.foundPreviewDetail.rows.length).toEqual(secondFetchDataLength);
    // // check redux state
    // const secondFetchDataReduxState = {
    //   [selectedCsvFileSourceUuid]: {
    //     chunkSize: 200,
    //     headers: fileHeaders,
    //     lastChunkNumber: 1,
    //     rows: generateRows(400),
    //     totalRows: 400,
    //   },
    // };
    // expect(store.getState().previewList).toEqual(secondFetchDataReduxState);
    //
    // // scrolling to reach 80% of total rows - fetching should not run, as totalRows has been reached
    // act(() => {
    //   result.current.handleScrollDebounced({
    //     visibleRowStartIndex: 0.7 * secondFetchDataLength,
    //     visibleRowStopIndex: 0.8 * secondFetchDataLength,
    //   });
    // });
    //
    // await waitForNextUpdate();
    //
    // // reached totalRows - 3rd fetch should not be triggered
    // expect(result.current.foundPreviewDetail.rows.length).toEqual(secondFetchDataLength);
    // // check redux state
    // expect(store.getState().previewList).toEqual(secondFetchDataReduxState);
  });
});
