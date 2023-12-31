import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import {
  basicUploadList,
  csvElementDetailEnrichStep1,
  csvElementDetailEnrichStep2,
  csvElementDetailEnrichStep2NotFetched,
  csvElementDetailNotFetched,
  selectedCsvFileUuid,
} from '../../../../../../utils/mockData';
import { TableModals, TableModalsProps } from '../TableModals';
import { truncateString } from '../../../../../notification/helpers';
import { NotificationAppearanceEnum } from '../../../../../notification/NotificationPopup';
import { RootState } from '../../../../../../redux/store';
import { ValidateSliceCaseReducers } from '@reduxjs/toolkit';
import { setFileList } from '../../../../../../redux/FileListSlice';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...basicUploadList,
        result: [csvElementDetailNotFetched, ...basicUploadList.result],
      }),
    );
  }),
  rest.post('/api/_internal/csv_delete', (req, res, ctx) =>
    res(ctx.json({ csvfile_uuid: selectedCsvFileUuid })),
  ),
  rest.post(
    `/api/_internal/csv_list/${csvElementDetailEnrichStep1.uuid}/enrich_detail_create`,
    (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({ task_id: '12345', csv_file_uuid: csvElementDetailEnrichStep1.uuid }),
      ),
  ),
  rest.post('/api/_internal/enrich_file_create', (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({ task_id: '12345', csv_file_uuid: csvElementDetailEnrichStep2.uuid }),
    ),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('TableModals', () => {
  const renderTableModalsWithProps = (
    props: TableModalsProps,
    extraReducers: ValidateSliceCaseReducers<any, any>[] = [],
  ): RootState => {
    const { store } = render(<TableModals {...props} />, extraReducers);
    return store;
  };

  const getActionButton = (): HTMLElement => {
    const actionButton = screen.getByTestId('action-button');
    expect(actionButton).toBeInTheDocument();
    return actionButton;
  };

  const checkCloseButton = (mockedAction: jest.Mock<any, any>): void => {
    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockedAction).toHaveBeenCalled();
  };

  describe('DeleteModal', () => {
    let store: RootState;
    const onCloseDeleteModalFn = jest.fn();

    beforeEach(() => {
      store = renderTableModalsWithProps({
        selectedFileElement: csvElementDetailNotFetched,
        openDeleteModal: true,
        onCloseDeleteModal: onCloseDeleteModalFn,
        openEnrichStep1Modal: false,
        onCloseEnrichStep1Modal: jest.fn(),
        openEnrichStep2Modal: false,
        onCloseEnrichStep2Modal: jest.fn(),
      });
    });
    test('Default render', () => {
      // check if modal is correctly rendered
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      expect(screen.getByText('Delete CSV record')).toBeInTheDocument();

      const modalTextElement = screen.getByTestId('delete-modal-text');
      const expectedText = `Are you sure you want to delete ${truncateString(
        csvElementDetailNotFetched.original_file_name,
        60,
      )}?`;
      expect(modalTextElement.textContent).toBe(expectedText);
    });

    test('Close button', () => {
      checkCloseButton(onCloseDeleteModalFn);
    });

    test('onAction button', async () => {
      // click on action button
      const actionButton = getActionButton();
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(store.getState().notificationPopup).toEqual([
          {
            additionalContent: '',
            appearance: NotificationAppearanceEnum.SUCCESS,
            content: `File ${csvElementDetailNotFetched.original_file_name} (${csvElementDetailNotFetched.uuid}) has been deleted.`,
            id: expect.any(String),
            permanent: false,
            timeoutId: undefined,
          },
        ]);
      });
    });
  });

  describe('EnrichStep1Modal', () => {
    let store: RootState;
    const onCloseEnrichStep1ModalFn = jest.fn();

    beforeEach(() => {
      server.use(
        rest.get('/api/_internal/csv_list', (req, res, ctx) => {
          return res.once(
            ctx.status(200),
            ctx.json({
              ...basicUploadList,
              result: [csvElementDetailEnrichStep1, ...basicUploadList.result],
            }),
          );
        }),
      );

      store = renderTableModalsWithProps({
        selectedFileElement: csvElementDetailEnrichStep1,
        openDeleteModal: false,
        onCloseDeleteModal: jest.fn(),
        openEnrichStep1Modal: true,
        onCloseEnrichStep1Modal: onCloseEnrichStep1ModalFn,
        openEnrichStep2Modal: false,
        onCloseEnrichStep2Modal: jest.fn(),
      });
    });
    test('Default render', () => {
      // check if modal is correctly rendered
      expect(screen.getByTestId('enrich-step-1-modal')).toBeInTheDocument();
      expect(screen.getByText('Enrich file data')).toBeInTheDocument();
      expect(screen.getByText('Step 1/2: Provide external URL')).toBeInTheDocument();
      expect(screen.getByTestId('url-input')).toBeInTheDocument();
      expect(screen.getByTestId('json-root-path')).toBeInTheDocument();
      expect(screen.getByTestId('open-enrich-json-root-path-modal')).toBeInTheDocument();

      const modalTextElement = screen.getByTestId('filename-text');
      const expectedText = `File: ${truncateString(
        csvElementDetailEnrichStep1.original_file_name,
        60,
      )}`;
      expect(modalTextElement.textContent).toBe(expectedText);
    });
    test('Close button', () => {
      checkCloseButton(onCloseEnrichStep1ModalFn);
    });
    test.each([
      ['success', true],
      ['input error', false],
    ])('onAction button > %s', async (_, isSuccess: boolean) => {
      // click on action button
      const actionButton = getActionButton();

      if (isSuccess) {
        fireEvent.change(screen.getByTestId('url-input'), {
          target: { value: 'https://example.com' },
        });
      }

      // check if there is no task before click on action button
      expect(store.getState().taskList).toEqual({});

      // click on action button
      fireEvent.click(actionButton);

      await waitFor(() => {
        if (isSuccess) {
          // check if popup emerge
          expect(store.getState().notificationPopup).toEqual([
            {
              additionalContent: '',
              appearance: NotificationAppearanceEnum.INFO,
              content: `Enrichment in process for file ${csvElementDetailEnrichStep1.original_file_name} (ID: ${csvElementDetailEnrichStep1.uuid})`,
              id: expect.any(String),
              permanent: false,
              timeoutId: undefined,
            },
          ]);

          // check if task is pushed to redux state
          expect(store.getState().taskList).toEqual({
            '12345': { instance: 'CsvFile', uuid: csvElementDetailEnrichStep1.uuid },
          });

          // check if popup will be closed
          expect(onCloseEnrichStep1ModalFn).toHaveBeenCalled();
        } else {
          // emerge error message
          expect(screen.getByTestId('error-info')).toBeInTheDocument();
          // check if popup didnt emerge
          expect(store.getState().notificationPopup).toHaveLength(0);
          // check if task is not pushed to redux state
          expect(store.getState().taskList).toEqual({});
        }
      });
    });
    test('EnrichJsonRootPathInfoModal', () => {
      expect(screen.queryAllByTestId('enrich-json-root-path-info-modal')).toHaveLength(0);
      fireEvent.click(screen.getByTestId('open-enrich-json-root-path-modal'));
      const infoModal = screen.getByTestId('enrich-json-root-path-info-modal');
      expect(infoModal).toBeInTheDocument();
      expect(screen.getByText('URL JSON root path setup')).toBeInTheDocument();

      //close button
      const closeButton = within(infoModal).getByTestId('close-button');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);

      // check if modal is closed
      expect(screen.queryAllByTestId('enrich-json-root-path-info-modal')).toHaveLength(0);
    });
  });

  describe('EnrichStep2Modal', () => {
    let store: RootState;
    const onCloseEnrichStep2ModalFn = jest.fn();

    beforeEach(() => {
      server.use(
        rest.get('/api/_internal/csv_list', (req, res, ctx) => {
          return res.once(
            ctx.status(200),
            ctx.json({
              ...basicUploadList,
              result: [csvElementDetailEnrichStep2, ...basicUploadList.result],
            }),
          );
        }),
      );

      store = renderTableModalsWithProps(
        {
          selectedFileElement: csvElementDetailEnrichStep2,
          openDeleteModal: false,
          onCloseDeleteModal: jest.fn(),
          openEnrichStep1Modal: false,
          onCloseEnrichStep1Modal: jest.fn(),
          openEnrichStep2Modal: true,
          onCloseEnrichStep2Modal: onCloseEnrichStep2ModalFn,
        },
        [setFileList([csvElementDetailEnrichStep2, ...basicUploadList.result])],
      );
    });
    test('Default render', () => {
      // check if modal is correctly rendered
      expect(screen.getByTestId('enrich-step-2-modal')).toBeInTheDocument();
      expect(screen.getByText('Enrich file data')).toBeInTheDocument();
      expect(screen.getByText('Step 2/2: Enrichment process')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-csv-header')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-join-type')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-flatten-structure')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-json-key')).toBeInTheDocument();

      const csvFileName = screen.getByTestId('filename-text');
      const expectedFileName = `${truncateString(
        csvElementDetailEnrichStep2.source_original_file_name,
        60,
      )}`;
      expect(csvFileName.textContent).toBe(expectedFileName);

      const externalResponseUrl = screen.getByTestId('enrich-detail-url');
      const expectedUrl = `${truncateString(
        csvElementDetailEnrichStep2.enrich_detail.external_url,
        60,
      )}`;
      expect(externalResponseUrl.textContent).toBe(expectedUrl);
    });

    test('Close button', () => {
      checkCloseButton(onCloseEnrichStep2ModalFn);
    });
    test.each([
      ['success', true],
      ['input error', false],
    ])('onAction button > %s', async (_, isSuccess: boolean) => {
      // click on action button
      const actionButton = getActionButton();

      if (isSuccess) {
        // open csv file header option
        const csvFileHeaderDropdown = screen.getByTestId('dropdown-csv-header');
        fireEvent.click(csvFileHeaderDropdown);

        // select csv file header option
        const csvHeaderOption = within(csvFileHeaderDropdown).getByText('post_id');
        fireEvent.click(csvHeaderOption);

        // open Json type dropdown
        const joinTypeDropdown = screen.getByTestId('dropdown-join-type');
        fireEvent.click(joinTypeDropdown);

        // select json type option
        const joinTypeOption = within(joinTypeDropdown).getByText('Left');
        fireEvent.click(joinTypeOption);

        // open json key dropdown
        const jsonKeyDropdown = screen.getByTestId('dropdown-json-key');
        fireEvent.click(jsonKeyDropdown);

        // select json key option
        const jsonKeyOption = within(jsonKeyDropdown).getByText('id');
        fireEvent.click(jsonKeyOption);

        // select flatten json structure checkbox
        const checkbox = screen.getByTestId('checkbox-flatten-structure');
        fireEvent.click(checkbox);
      }

      // check if there is no task before click on action button
      expect(store.getState().taskList).toEqual({});

      // click on action button
      fireEvent.click(actionButton);

      await waitFor(() => {
        if (isSuccess) {
          // check if popup emerge
          expect(store.getState().notificationPopup).toEqual([
            {
              additionalContent: '',
              appearance: NotificationAppearanceEnum.INFO,
              content: `Enrichment in process for file ${csvElementDetailEnrichStep2.original_file_name} (ID: ${csvElementDetailEnrichStep2.uuid})`,
              id: expect.any(String),
              permanent: false,
              timeoutId: undefined,
            },
          ]);

          // check if task is pushed to redux state
          expect(store.getState().taskList).toEqual({
            '12345': { instance: 'CsvFile', uuid: csvElementDetailEnrichStep2.uuid },
          });

          // check if popup will be closed
          expect(onCloseEnrichStep2ModalFn).toHaveBeenCalled();
        } else {
          // emerge error message
          expect(screen.queryAllByTestId('error-info')).toHaveLength(2);
          expect(screen.getByText('Select join type')).toBeInTheDocument();
          expect(screen.getByText('Select JSON key')).toBeInTheDocument();
          // check if popup didnt emerge
          expect(store.getState().notificationPopup).toHaveLength(0);
          // check if task is not pushed to redux state
          expect(store.getState().taskList).toEqual({});
        }
      });
    });
    test('EnrichJsonJoinTypeInfoModal', () => {
      expect(screen.queryAllByTestId('enrich-json-join-type-info-modal')).toHaveLength(0);
      fireEvent.click(screen.getByTestId('open-enrich-json-join-type-info-modal'));
      const infoModal = screen.getByTestId('enrich-json-join-type-info-modal');
      expect(infoModal).toBeInTheDocument();
      expect(screen.getByText('JSON join types')).toBeInTheDocument();

      //close button
      const closeButton = within(infoModal).getByTestId('close-button');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);

      // check if modal is closed
      expect(screen.queryAllByTestId('enrich-json-join-type-info-modal')).toHaveLength(0);
    });
    test('EnrichJsonFlattenStructureInfoModal', () => {
      expect(screen.queryAllByTestId('enrich-json-flatten-structure-info-modal')).toHaveLength(0);
      fireEvent.click(screen.getByTestId('open-enrich-json-flatten-structure-info-modal'));
      const infoModal = screen.getByTestId('enrich-json-flatten-structure-info-modal');
      expect(infoModal).toBeInTheDocument();
      expect(screen.getByText('JSON flatten structure')).toBeInTheDocument();

      //close button
      const closeButton = within(infoModal).getByTestId('close-button');
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);

      // check if modal is closed
      expect(screen.queryAllByTestId('enrich-json-flatten-structure-info-modal')).toHaveLength(0);
    });
  });
  test('EnrichStep2Modal - Render spinner while fetchedDetailInfo=false + fetching correct data', async () => {
    server.use(
      rest.get('/api/_internal/csv_list', (req, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({
            ...basicUploadList,
            result: [csvElementDetailEnrichStep2NotFetched, ...basicUploadList.result],
          }),
        );
      }),
      rest.get(`/api/_internal/csv_list/${selectedCsvFileUuid}`, (req, res, ctx) => {
        return res.once(ctx.status(200), ctx.json(csvElementDetailEnrichStep2));
      }),
    );

    const store = renderTableModalsWithProps(
      {
        selectedFileElement: csvElementDetailEnrichStep2NotFetched,
        openDeleteModal: false,
        onCloseDeleteModal: jest.fn(),
        openEnrichStep1Modal: false,
        onCloseEnrichStep1Modal: jest.fn(),
        openEnrichStep2Modal: true,
        onCloseEnrichStep2Modal: jest.fn(),
      },
      [setFileList([csvElementDetailEnrichStep2NotFetched, ...basicUploadList.result])],
    );
    // check if modal is correctly rendered
    expect(screen.getByTestId('enrich-step-2-modal')).toBeInTheDocument();
    expect(screen.getByText('Enrich file data')).toBeInTheDocument();
    expect(screen.getByText('Step 2/2: Enrichment process')).toBeInTheDocument();

    // first element in file list is fetchedDetailInfo=false. Now, we should fetch expanded data and show spinners
    expect(store.getState().fileList.fileList[0]).toEqual(csvElementDetailEnrichStep2NotFetched);
    expect(screen.queryAllByTestId('spinner')).toHaveLength(2);

    await waitFor(() => {
      // element should be data to expand this element
      expect(store.getState().fileList.fileList[0]).toEqual(csvElementDetailEnrichStep2);
    });
  });
});
