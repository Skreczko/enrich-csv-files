import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Dropdown } from 'semantic-ui-react';
import { useFetchUploadList } from './useFetchUploadList';
import { PageSizeWrapper } from './PageSizeDropdown.styled';

export const PageSizeDropdown: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const page_size: number = useSelector((state: RootState) => state.fileList.paginator.page_size);

  return (
    <PageSizeWrapper>
      <p>Per page:</p>
      <Dropdown
        clearable
        options={[
          { value: 5, text: '5' },
          { value: 10, text: '10' },
          { value: 20, text: '20' },
          { value: 50, text: '50' },
        ]}
        selection
        value={page_size}
        onChange={(e, { value }): Promise<void> => fetchListData({ page_size: value as number })}
      />
    </PageSizeWrapper>
  );
};
