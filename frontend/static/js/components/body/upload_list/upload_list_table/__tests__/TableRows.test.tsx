import React from 'react';
import { fireEvent, render, screen } from '../../../../../utils/testing-utils';
import {
  basicUploadList,
  csvElementDetailEnrichStep1,
  csvElementDetailEnrichStep2,
} from '../../../../../utils/mockData';
import { setFileList, setPaginator } from '../../../../../redux/FileListSlice';
import { TableRows } from '../TableRows';
import { CsvFileElement } from '../../../../../api/types';

describe('TableRows', () => {
  const checkModal = (data: {
    modalTestId: string;
    openModalTestId: string;
    csvElementAtBegining?: CsvFileElement;
  }): void => {
    const { modalTestId, openModalTestId, csvElementAtBegining } = data;
    render(<TableRows />, [
      setFileList(
        csvElementAtBegining
          ? [csvElementAtBegining, ...basicUploadList.result]
          : basicUploadList.result,
      ),
      setPaginator(basicUploadList.paginator),
    ]);
    // check if modal is not opened
    expect(screen.queryAllByTestId(modalTestId)).toHaveLength(0);

    // open modal button - selected related buttons from first element
    const openButton = screen.queryAllByTestId(openModalTestId)[0];
    expect(openButton).toBeInTheDocument();

    fireEvent.click(openButton);

    // check if modal is opened
    expect(screen.getByTestId(modalTestId)).toBeInTheDocument();

    // close modal button
    const closeButton = screen.getByTestId('close-button');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    // check if modal is closed
    expect(screen.queryAllByTestId(modalTestId)).toHaveLength(0);
  };

  test.each([
    ['with fileList', true],
    ['without fileList', false],
  ])('Default render > %s', (_, isFileList: boolean) => {
    render(<TableRows />, [
      setFileList(isFileList ? basicUploadList.result : []),
      setPaginator(isFileList ? basicUploadList.paginator : null),
    ]);
    expect(screen.getByTestId('table-rows')).toBeInTheDocument();

    if (isFileList) {
      expect(screen.queryAllByTestId('no-record')).toHaveLength(0);
      expect(screen.queryAllByTestId('table-row')).toHaveLength(5);
    } else {
      expect(screen.getByTestId('no-record')).toBeInTheDocument();
      expect(screen.queryAllByTestId('table-row')).toHaveLength(0);
    }
  });
  test.each([
    [
      'EnrichStep1Modal',
      {
        modalTestId: 'enrich-step-1-modal',
        openModalTestId: 'open-enrich-step-1-modal-button',
        csvElementAtBegining: csvElementDetailEnrichStep1,
      },
    ],
    [
      'EnrichStep2Modal',
      {
        modalTestId: 'enrich-step-2-modal',
        openModalTestId: 'open-enrich-step-2-modal-button',
        csvElementAtBegining: csvElementDetailEnrichStep2,
      },
    ],
    [
      'DeleteModal',
      {
        modalTestId: 'delete-modal',
        openModalTestId: 'open-delete-modal-button',
      },
    ],
  ])(
    'Open/close modal > %s',
    (
      _,
      data: { modalTestId: string; openModalTestId: string; csvElementAtBegining?: CsvFileElement },
    ) => {
      checkModal(data);
    },
  );
});
