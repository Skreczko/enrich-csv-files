import React, { useEffect } from 'react';
import { UploadListWrapper } from './UploadList.styled';
import { ListManagement } from './list_management/ListManagement';
import { useFetchUploadList } from './useFetchUploadList';
import { UploadTable } from './table/UploadTable';

export const UploadList: React.FC = () => {
  const fetchListData = useFetchUploadList();

  useEffect(() => {
    fetchListData();
  }, []);

  return (
    <UploadListWrapper>
      <ListManagement />
      <UploadTable />
    </UploadListWrapper>
  );
};
