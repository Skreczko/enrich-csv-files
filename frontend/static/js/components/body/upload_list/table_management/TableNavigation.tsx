import React from 'react';
import { useSelector } from 'react-redux';
import { FileListState } from '../../../../redux/FileListSlice';
import { RootState } from '../../../../redux/store';
import { Paginator } from './Paginator';
import { PageSizeDropdown } from './PageSizeDropdown';

export const TableNavigation: React.FC = () => {
  const { paginator, fileList }: FileListState = useSelector((state: RootState) => state.fileList);
  return (
    <>
      {paginator?.total_pages > 1 && <Paginator />}
      {!!fileList?.length && <PageSizeDropdown />}
    </>
  );
};
