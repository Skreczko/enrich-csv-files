import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Dropdown } from 'semantic-ui-react';
import { useFetchUploadList } from './useFetchUploadList';
import { PageSizeWrapper } from './PageSizeDropdown.styled';
import { PaginatorType } from '../../../api/types';

export const PageSizeDropdown: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const paginator: PaginatorType = useSelector((state: RootState) => state.fileList.paginator);

  return (
    <PageSizeWrapper>
      <p>Per page:</p>
      <Dropdown
        options={[
          { value: 5, text: '5' },
          { value: 10, text: '10' },
          { value: 20, text: '20' },
          { value: 50, text: '50' },
        ]}
        selection
        value={paginator?.page_size}
        onChange={(e, { value }): Promise<void> =>
          fetchListData({ page_size: value as number, page: 1 })
        }
      />
    </PageSizeWrapper>
  );
};
