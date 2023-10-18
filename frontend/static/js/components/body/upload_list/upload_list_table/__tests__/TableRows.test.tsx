import React from 'react';
import { render, screen } from '../../../../../utils/testing-utils';
import { basicUploadList } from '../../../../../utils/mockData';
import { setFileList, setPaginator } from '../../../../../redux/FileListSlice';
import { TableRows } from '../TableRows';

describe('TableRows', () => {
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
});
