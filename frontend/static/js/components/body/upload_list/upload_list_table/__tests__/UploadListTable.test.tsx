import React from 'react';
import { render, screen, waitFor } from '../../../../../utils/testing-utils';
import { basicUploadList } from '../../../../../utils/mockData';
import { UploadListTable } from '../UploadListTable';
import { setFileList, setIsLoading, setPaginator } from '../../../../../redux/FileListSlice';

describe('UploadListTable', () => {
  test.each([
    ['with spinner', true],
    ['without spinner', false],
  ])('Default render > %s', async (_, isLoading: boolean) => {
    render(<UploadListTable />, [
      setIsLoading(isLoading),
      setFileList(basicUploadList.result),
      setPaginator(basicUploadList.paginator),
    ]);
    expect(screen.getByTestId('upload-list-table')).toBeInTheDocument();
    expect(screen.queryAllByTestId('table-header')).toHaveLength(7);

    if (isLoading) {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryAllByTestId('table-rows')).toHaveLength(0);
    } else {
      // data fetching
      await waitFor(() => {
        expect(screen.queryAllByTestId('spinner')).toHaveLength(0);
        expect(screen.getByTestId('table-rows')).toBeInTheDocument();
      });
    }
  });
});
