import React from 'react';
import { CustomDropdown } from '../../CustomDropdown';
import { useFetchUploadList } from '../../../hooks/useFetchUploadList';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { SortList } from '../../../../api/enums';
import { DropdownItemEnum, DropdownOptions } from './types';
import SortImage from '../../../../../img/body/list/sorting.png';
import { SortingWrapper } from './Sorting.styled';

const sortOptions: DropdownOptions[] = [
  { type: DropdownItemEnum.HEADER, content: 'File name' },
  {
    type: DropdownItemEnum.OPTION,
    value: SortList.ORIGINAL_FILE_NAME_ASC,
    text: 'File name (ASC)',
  },
  {
    type: DropdownItemEnum.OPTION,
    value: SortList.ORIGINAL_FILE_NAME_DESC,
    text: 'File name (DESC)',
  },
  { type: DropdownItemEnum.HEADER, content: 'Created' },
  { type: DropdownItemEnum.OPTION, value: SortList.CREATED_ASC, text: 'Created (ASC)' },
  { type: DropdownItemEnum.OPTION, value: SortList.CREATED_DESC, text: 'Created (DESC)' },
  { type: DropdownItemEnum.HEADER, content: 'Status' },
  { type: DropdownItemEnum.OPTION, value: SortList.STATUS_ASC, text: 'Status (ASC)' },
  { type: DropdownItemEnum.OPTION, value: SortList.STATUS_DESC, text: 'Status (DESC)' },
  { type: DropdownItemEnum.HEADER, content: 'Source file name' },
  {
    type: DropdownItemEnum.OPTION,
    value: SortList.SOURCE_ORIGINAL_FILE_NAME_ASC,
    text: 'SFN (ASC)',
  },
  {
    type: DropdownItemEnum.OPTION,
    value: SortList.SOURCE_ORIGINAL_FILE_NAME_DESC,
    text: 'SFN (DESC)',
  },
  { type: DropdownItemEnum.HEADER, content: 'Enrich URL' },
  { type: DropdownItemEnum.OPTION, value: SortList.ENRICH_URL_ASC, text: 'Enrich URL (ASC)' },
  {
    type: DropdownItemEnum.OPTION,
    value: SortList.ENRICH_URL_DESC,
    text: 'Enrich URL (DESC)',
  },
];

export const Sorting: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const sort: SortList = useSelector((state: RootState) => state.fileListParam.sort);
  return (
    <SortingWrapper>
      <img src={SortImage} alt={'sort'} />
      <CustomDropdown
        options={sortOptions}
        value={sort}
        onClick={(value): Promise<void> => fetchListData({ sort: value as SortList, page: 1 })}
        placeholderOnSelected={'Sorted by:'}
        placeholderOnChoice={'Select sorting'}
        width={'220px'}
      />
    </SortingWrapper>
  );
};
