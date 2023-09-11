import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { PaginatorType } from '../../../api/types';
import { useFetchUploadList } from './useFetchUploadList';
import { PaginatorWrapper } from './Paginator.styled';

export const Paginator: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const { page, total_pages }: PaginatorType = useSelector(
    (state: RootState) => state.fileList.paginator,
  );

  const onChangePageNumber = ({ selected }: { selected: number }): void => {
    fetchListData({ page: selected + 1 });
  };

  return (
    <PaginatorWrapper
      previousLabel={'previous'}
      nextLabel={'next'}
      breakLabel={'...'}
      breakClassName={'page'}
      initialPage={page - 1}
      pageCount={total_pages || 1}
      marginPagesDisplayed={2}
      pageRangeDisplayed={2}
      onPageChange={onChangePageNumber}
      containerClassName={'pagination'}
      disabledClassName={'disabled'}
      activeClassName={'active'}
      nextClassName={'page'}
      previousClassName={'page'}
      pageClassName={'page'}
    />
  );
};
