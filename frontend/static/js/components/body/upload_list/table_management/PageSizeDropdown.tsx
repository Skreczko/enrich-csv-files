import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { useFetchUploadList } from '../../../hooks/useFetchUploadList';
import { PageSizeWrapper } from './PageSizeDropdown.styled';
import { PaginatorType } from '../../../../api/types';
import { CustomDropdown } from '../../CustomDropdown';
import { DropdownItemEnum, DropdownOptions } from './types';

const pageSizeOptions: DropdownOptions[] = [
  { type: DropdownItemEnum.OPTION, value: 10, text: '10' },
  { type: DropdownItemEnum.OPTION, value: 20, text: '20' },
  { type: DropdownItemEnum.OPTION, value: 50, text: '50' },
];

export const PageSizeDropdown: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const paginator: PaginatorType = useSelector((state: RootState) => state.fileList.paginator);

  return (
    <PageSizeWrapper>
      <CustomDropdown
        options={pageSizeOptions}
        value={paginator?.page_size}
        onClick={(value): Promise<void> => fetchListData({ page_size: value as number, page: 1 })}
        placeholderOnSelected={'Per page:'}
        placeholderOnChoice={'Select per page'}
        width={'120px'}
      />
    </PageSizeWrapper>
  );
};
