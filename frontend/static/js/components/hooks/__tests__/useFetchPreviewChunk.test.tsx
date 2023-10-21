import { Provider } from 'react-redux';
import { useFetchPreviewChunk, UseFetchPreviewChunkResult } from '../useFetchPreviewChunk';
import { renderHook, RenderResult, WaitForNextUpdate } from '@testing-library/react-hooks';
import { storeReducer } from '../../../redux/store';
import { AnyAction, configureStore, ThunkMiddleware } from '@reduxjs/toolkit';
import React from 'react';
import { fileHeaders, selectedCsvFileSourceUuid } from '../../../utils/mockData';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { act } from 'react-dom/test-utils';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';

const incorrectUuid = '11111111-aaaa-2222-cccc-333333333333';

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
        chunk_number: Number(chunkNumber),
        chunk_size: defaultChunkSize,
        headers: fileHeaders,
        total_rows: 400,
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
  rest.get(`/api/_internal/csv_list/${incorrectUuid}/read_preview_chunk`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Error reading CSV file.' }));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('useFetchPreviewChunk', () => {
  const prepareRenderHook = (
    isCorrectUuid = true,
  ): {
    store: ToolkitStore<any, any, [ThunkMiddleware<any, AnyAction, undefined>]>;
    result: RenderResult<UseFetchPreviewChunkResult>;
    waitForNextUpdate: WaitForNextUpdate;
  } => {
    const store = configureStore({
      reducer: storeReducer,
    });

    const { result, waitForNextUpdate } = renderHook<{}, UseFetchPreviewChunkResult>(
      () => useFetchPreviewChunk(isCorrectUuid ? selectedCsvFileSourceUuid : incorrectUuid),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      },
    );
    return { store, result, waitForNextUpdate };
  };

  test.each([
    ['correct uuid', true],
    ['incorrect uuid', false],
  ])('Initial run with %s', async (_, correctUuid: boolean) => {
    // check if fetching data is proceeded
    const { store, result, waitForNextUpdate } = prepareRenderHook(correctUuid);
    expect(result.current.initialLoading).toBe(true);

    await waitForNextUpdate();

    // assign expected redux state depending on uuid
    let expectedPreviewList;
    if (correctUuid) {
      expectedPreviewList = {
        [selectedCsvFileSourceUuid]: {
          chunkSize: 200,
          headers: fileHeaders,
          lastChunkNumber: 0,
          rows: generateRows(200),
          totalRows: 400,
        },
      };
    } else {
      expectedPreviewList = {};
    }

    expect(store.getState().previewList).toEqual(expectedPreviewList);
    expect(result.current.initialLoading).toBe(false);
    expect(result.current.notFound).toBe(!correctUuid);
  });
  test('Load more preview chunks when scrolling', async () => {
    const { store, result, waitForNextUpdate } = prepareRenderHook();

    await waitForNextUpdate();

    // at initial run - 200 rows should be fetched
    const initialDataLength = result.current.foundPreviewDetail.rows.length;
    expect(result.current.foundPreviewDetail.rows.length).toEqual(initialDataLength);
    // check redux state
    expect(store.getState().previewList).toEqual({
      [selectedCsvFileSourceUuid]: {
        chunkSize: 200,
        headers: fileHeaders,
        lastChunkNumber: 0,
        rows: generateRows(200),
        totalRows: 400,
      },
    });

    // scrolling to reach 80% of total rows - that should trigger fetching another 200 rows (400 total)
    act(() => {
      result.current.handleScrollDebounced({
        visibleRowStartIndex: 0.7 * initialDataLength,
        visibleRowStopIndex: 0.8 * initialDataLength,
      });
    });

    await waitForNextUpdate();

    const secondFetchDataLength = 400;
    expect(result.current.foundPreviewDetail.rows.length).toEqual(secondFetchDataLength);
    // check redux state
    const secondFetchDataReduxState = {
      [selectedCsvFileSourceUuid]: {
        chunkSize: 200,
        headers: fileHeaders,
        lastChunkNumber: 1,
        rows: generateRows(400),
        totalRows: 400,
      },
    };
    expect(store.getState().previewList).toEqual(secondFetchDataReduxState);

    // scrolling to reach 80% of total rows - fetching should not run, as totalRows has been reached
    act(() => {
      result.current.handleScrollDebounced({
        visibleRowStartIndex: 0.7 * secondFetchDataLength,
        visibleRowStopIndex: 0.8 * secondFetchDataLength,
      });
    });

    await waitForNextUpdate();

    // reached totalRows - 3rd fetch should not be triggered
    expect(result.current.foundPreviewDetail.rows.length).toEqual(secondFetchDataLength);
    // check redux state
    expect(store.getState().previewList).toEqual(secondFetchDataReduxState);
  });
});
