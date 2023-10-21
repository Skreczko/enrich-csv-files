import React from 'react';
import { useSelector } from 'react-redux';
import { FileListState } from '../../../../redux/FileListSlice';
import { RootState } from '../../../../redux/store';
import { Spinner } from '../../Spinner';
import { CustomTable, TableRowFullWidth } from './UploadListTable.styled';
import { TableHeader } from './TableHeader';
import { TableRows } from './TableRows';

export const UploadListTable: React.FC = () => {
  const { isLoading }: FileListState = useSelector((state: RootState) => state.fileList);

  return (
    <CustomTable data-testid={'upload-list-table'}>
      <TableHeader />
      {isLoading ? (
        <TableRowFullWidth>
          <Spinner />
        </TableRowFullWidth>
      ) : (
        <TableRows />
      )}
    </CustomTable>
  );
};
