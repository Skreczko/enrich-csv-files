import React from 'react';
import { FiltersWrappers } from './Filters.styled';
import FilterImage from '../../../../../img/body/list/filter2.png';
import { CustomDropdown } from '../../CustomDropdown';
import { DropdownItemEnum, DropdownOptions } from './types';
import { useFetchUploadList } from '../useFetchUploadList';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { CustomDatePicker } from '../../CustomDatePicker';
import { FileListFilters, FileTypeFilter, StatusFilter } from '../../../../api/types';

const statusFilterOptions: DropdownOptions[] = [
  { type: DropdownItemEnum.OPTION, value: StatusFilter.COMPLETED, text: 'Completed' },
  { type: DropdownItemEnum.OPTION, value: StatusFilter.IN_PROGRESS, text: 'In progress' },
  { type: DropdownItemEnum.OPTION, value: StatusFilter.FAILED, text: 'Failed' },
];

const fileTypeFilterOptions: DropdownOptions[] = [
  { type: DropdownItemEnum.OPTION, value: FileTypeFilter.SOURCE, text: 'Source' },
  { type: DropdownItemEnum.OPTION, value: FileTypeFilter.ENRICHED, text: 'Enriched' },
];

export const Filters: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const filters: FileListFilters = useSelector((state: RootState) => state.fileListParam.filters);

  return (
    <FiltersWrappers>
      <img src={FilterImage} alt={'filter'} />
      <CustomDropdown
        clearable={true}
        options={fileTypeFilterOptions}
        value={filters.file_type}
        onClick={(value): Promise<void> =>
          fetchListData({
            filters: {
              ...filters,
              file_type: value as FileTypeFilter,
            },
            page: 1,
          })
        }
        placeholderOnSelected={'File type'}
        placeholderOnChoice={'Filter by: File type'}
        width={'150px'}
      />
      <CustomDropdown
        clearable={true}
        options={statusFilterOptions}
        value={filters.status}
        onClick={(value): Promise<void> =>
          fetchListData({
            filters: {
              ...filters,
              status: value as StatusFilter,
            },
            page: 1,
          })
        }
        placeholderOnSelected={'Status'}
        placeholderOnChoice={'Filter by: Status'}
        width={'150px'}
      />
      <CustomDatePicker
        onChange={(isoDateString): Promise<void> =>
          fetchListData({
            filters: {
              ...filters,
              date_from: isoDateString,
            },
            page: 1,
          })
        }
        placeholderOnChoice={'Filter by: Created from'}
        placeholderOnSelected={'Created from'}
        selectedDate={filters.date_from}
        maxDate={filters.date_to}
        width={'200px'}
      />
      <CustomDatePicker
        onChange={(isoDateString): Promise<void> =>
          fetchListData({
            filters: {
              ...filters,
              date_to: isoDateString,
            },
            page: 1,
          })
        }
        placeholderOnChoice={'Filter by: Created to'}
        placeholderOnSelected={'Created to'}
        selectedDate={filters.date_to}
        minDate={filters.date_from}
        width={'200px'}
      />
    </FiltersWrappers>
  );
};
