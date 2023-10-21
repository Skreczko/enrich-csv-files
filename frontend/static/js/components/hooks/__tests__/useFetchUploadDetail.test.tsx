import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks';
import { storeReducer } from '../../../redux/store';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import {
  basicUploadList,
  csvElementDetailFetched,
  csvElementDetailNotFetched,
  selectedCsvFileUuid,
} from '../../../utils/mockData';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { useFetchUploadDetail } from '../useFetchUploadDetail';
import { setFileList, setPaginator } from '../../../redux/FileListSlice';
import { CsvFileElement } from '../../../api/types';
import { waitFor } from '@testing-library/react';

const incorrectUuid = '11111111-aaaa-2222-cccc-333333333333';

const server = setupServer(
  rest.get(`/api/_internal/csv_list/${selectedCsvFileUuid}`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(csvElementDetailFetched));
  }),
  rest.get(`/api/_internal/csv_list/${incorrectUuid}`, (req, res, ctx) => {
    return res(ctx.status(500));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('useFetchUploadDetail', () => {
  test.each([
    ['correct uuid', true],
    ['incorrect uuid', false],
  ])('Run custom hook function with %s', async (_, correctUuid: boolean) => {
    const store = configureStore({
      reducer: storeReducer,
    });

    // push initial state to redux
    store.dispatch(setPaginator(basicUploadList.paginator));
    store.dispatch(setFileList([csvElementDetailNotFetched, ...basicUploadList.result]));

    // check if initial state is set to redux
    expect(
      store
        .getState()
        .fileList.fileList.filter(
          (csvFile: CsvFileElement) => csvFile.uuid === selectedCsvFileUuid,
        )[0],
    ).toEqual(csvElementDetailNotFetched);

    const { result } = renderHook<{}, (uuid: string) => Promise<void>>(
      () => useFetchUploadDetail(),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      },
    );

    // run custom hook
    result.current(correctUuid ? selectedCsvFileUuid : incorrectUuid);

    // for correct uuid - csvFile element in redux should be updated. For incorrect uuid - nothing should happen
    await waitFor(() => {
      if (correctUuid) {
        expect(
          store
            .getState()
            .fileList.fileList.filter(
              (csvFile: CsvFileElement) => csvFile.uuid === selectedCsvFileUuid,
            )[0],
        ).toEqual(csvElementDetailFetched);
      } else {
        expect(
          store
            .getState()
            .fileList.fileList.filter(
              (csvFile: CsvFileElement) => csvFile.uuid === selectedCsvFileUuid,
            )[0],
        ).toEqual(csvElementDetailNotFetched);
      }
    });
  });
});
