import React from 'react';
import { UploadListWrapper } from './UploadList.styled';
import { UploadListManagement } from './list_management/UploadListManagement';
import { useFetchUploadList } from './useFetchUploadList';

export const UploadList: React.FC = () => {
  useFetchUploadList();

  return (
    <UploadListWrapper>
      <UploadListManagement />
      {/*<UploadTable />*/}
    </UploadListWrapper>
  );
};
