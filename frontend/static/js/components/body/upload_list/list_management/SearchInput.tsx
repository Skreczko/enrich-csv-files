import React, { useCallback, useEffect, useState } from 'react';
import SearchImage from '../../../../../img/body/list/search.png';
import { SearchIconWrapper, SearchInputWrapper, StyledInput } from './SearchInput.styled';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import _ from 'lodash';
import { FileListParamState, setSearch } from '../../../../redux/fileListParamSlice';

export const SearchInput: React.FC = () => {
  const dispatch = useDispatch();
  const params: FileListParamState = useSelector((state: RootState) => state.fileListParam);
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
