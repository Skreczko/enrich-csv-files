import { Provider } from 'react-redux';
import { act, renderHook, WaitForNextUpdate } from '@testing-library/react-hooks';
import { storeReducer } from '../../../redux/store';
import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import {
  basicUploadList,
  csvElementDetailEnrichStep1,
  csvElementDetailEnrichStep2,
  csvElementDetailFetched,
  selectedCsvFileUuid,
} from '../../../utils/mockData';
import { setupServer } from 'msw/node';
import { MockedResponse, ResponseTransformer, rest, RestContext } from 'msw';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { useTaskDispatcher } from '../useTaskDispatcher';
import { setTask } from '../../../redux/TaskListReducer';
import { setFileList, setPaginator } from '../../../redux/FileListSlice';
import { TaskResultFailure, TaskResultPending, TaskResultSuccess } from '../../../api/types';
import { CeleryTaskStatus } from '../../../api/enums';
import { waitFor } from '@testing-library/react';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup';
import { MaybePromise } from '@reduxjs/toolkit/dist/query/tsHelpers';

const taskId = '8f3d2f80-6647-496c-9dab-0123b73f6da6';

// variable used to change mocked response from taskResultPending(1st request)
// to taskResultSuccess/taskResultFailure (2nd request)
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

const fetchTaskResultResponse = (
  res: (...transformers: ResponseTransformer<any>[]) => MaybePromise<MockedResponse<any>>,
  ctx: RestContext,
  isSuccess = true,
): Promise<MockedResponse<any>> => {
  return new Promise(resolve => {
    if (requestCount >= 1) {
      resolve(res(ctx.status(200), ctx.json(isSuccess ? taskResultSuccess : taskResultFailure)));
    } else {
      requestCount += 1;
      resolve(res(ctx.status(200), ctx.json(taskResultPending)));
    }
  });
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
    // to check if request will be refetch again including timeout dispatch
    if (requestCount >= 1) {
      return fetchTaskResultResponse(res, ctx);
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
  act(() => {
    store.dispatch(setTask({ [taskId]: { instance: 'CsvFile', uuid: selectedCsvFileUuid } }));
    store.dispatch(setPaginator(basicUploadList.paginator));
    store.dispatch(setFileList([csvElementDetailEnrichStep2, ...basicUploadList.result]));
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
  beforeEach(() => {
    // reset request counter
    requestCount = 0;
  });
  test.each([
    ['taskResultSuccess', true],
    ['taskResultFailure', false],
  ])('Celery taskResultPending and then %s', async (_, isSuccess: boolean) => {
    if (!isSuccess) {
      server.use(
        rest.post('/api/_internal/fetch_task_results', (req, res, ctx) => {
          // to check if request will be refetch again including timeout dispatch
          if (requestCount >= 1) {
            return fetchTaskResultResponse(res, ctx, isSuccess);
          } else {
            requestCount += 1;
            return res(ctx.status(200), ctx.json(taskResultPending));
          }
        }),
      );
    }

    const { store, result, waitForNextUpdate } = prepareRenderHook();

    // check if notifications are empty
    expect(store.getState().notificationPopup).toHaveLength(0);

    await act(async () => {
      // run hook
      result.timeoutTaskDispatcher([taskId]);
      // wait for async actions (fetch with pending -> timeout -> fetch with success -> redux update). 10s just in case.
      await waitForNextUpdate({ timeout: 10000 });
    });

    await waitFor(() => {
      // task list should be empty -> cleared after successful request
      expect(store.getState().taskList).toEqual({});
      // notification should emerge
      expect(store.getState().notificationPopup).toHaveLength(1);
    });
    // check notification status
    expect(store.getState().notificationPopup[0]['appearance']).toEqual(
      isSuccess ? NotificationAppearanceEnum.SUCCESS : NotificationAppearanceEnum.ERROR,
    );

    if (isSuccess) {
      // check if related csvFile has been updated
      expect(store.getState().fileList.fileList[0]).toEqual(csvElementDetailFetched);
    } else {
      // check if related csvFile has not been updated
      expect(store.getState().fileList.fileList[0]).not.toEqual(csvElementDetailFetched);
    }
  });
});
