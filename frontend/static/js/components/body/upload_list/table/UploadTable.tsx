import React from 'react';
import { useSelector } from 'react-redux';
import { FileListState } from '../../../../redux/FileListSlice';
import { RootState } from '../../../../redux/store';
import { Spinner } from '../../Spinner';
import { CustomTable, TableRowFullWidth } from './UploadTable.styled';
import { TableHeader } from './TableHeader';
import { TableRows } from './TableRows';
import { Paginator } from '../Paginator';
import { PageSizeDropdown } from '../PageSizeDropdown';

export const UploadTable: React.FC = () => {
  const { isLoading, paginator }: FileListState = useSelector((state: RootState) => state.fileList);

  return (
    <CustomTable>
      <TableHeader />
      {isLoading ? (
        <TableRowFullWidth>
          <Spinner />
        </TableRowFullWidth>
      ) : (
        <TableRows />
      )}
      {paginator?.total_pages > 1 && <Paginator />}
      {!!paginator?.total_pages && <PageSizeDropdown />}
    </CustomTable>
  );
};
