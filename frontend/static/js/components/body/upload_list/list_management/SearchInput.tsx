import React, { useCallback, useEffect, useState } from 'react';
import { FileListManagementType, setSearch } from '../../../../redux/FileListManagementSlice';
import SearchImage from '../../../../../img/body/list/search.png';
import { SearchIconWrapper, SearchInputWrapper, StyledInput } from './SearchInput.styled';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import _ from 'lodash';

export const SearchInput: React.FC = () => {
  const dispatch = useDispatch();
  const params: FileListManagementType = useSelector(
    (state: RootState) => state.fileListManagement,
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const debouncedSearch = useCallback(
    _.debounce((value: string) => {
      dispatch(setSearch(value));
    }, 1000),
    [],
  );

  useEffect(() => {
    // to prevent run when component has just been mounted
    if (searchValue !== params.search) {
      debouncedSearch(searchValue);
    }
  }, [searchValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    setSearchValue(value);
  };

  return (
    <SearchInputWrapper>
      <StyledInput type='text' placeholder='Search...' onChange={onChange} value={searchValue} />
      <SearchIconWrapper>
        <img src={SearchImage} alt={'search'} />
      </SearchIconWrapper>
    </SearchInputWrapper>
  );
};
