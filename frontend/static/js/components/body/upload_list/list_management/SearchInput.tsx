import React, { useCallback, useEffect, useRef, useState } from 'react';
import SearchImage from '../../../../../img/body/list/search.png';
import { SearchIconWrapper, SearchInputWrapper, StyledInput } from './SearchInput.styled';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import _ from 'lodash';
import { FileListParamState } from '../../../../redux/fileListParamSlice';
import { useFetchUploadList } from '../useFetchUploadList';

export const SearchInput: React.FC = () => {
  const params: FileListParamState = useSelector((state: RootState) => state.fileListParam);
  const fetchListData = useFetchUploadList();

  const [searchValue, setSearchValue] = useState<string>(params.search || '');

  // The `isUserUpdate` ref is introduced to differentiate between user-initiated changes and programmatic changes to the `searchValue` state.
  // Initially, we want to set the `searchValue` based on the value from the Redux's `params`.
  // However, any change to `searchValue` triggers the `debouncedSearch` function, which in turn dispatches an action.
  // To avoid dispatching this action when we're just setting the initial value (which is not a user-initiated change),
  // we use the `isUserUpdate` ref. When the change is user-initiated, the ref is set to true, allowing the dispatch.
  // For programmatic changes, the ref remains false, preventing unnecessary dispatches.
  const isUserUpdate = useRef(false);

  // Debounced function to delay dispatching the search action until the user stops typing.
  const debouncedSearch = useCallback(
    _.debounce((value: string) => {
      fetchListData({ ...params, search: value });
    }, 1000),
    [params],
  );

  useEffect(() => {
    // Synchronize the local state with the Redux state.
    setSearchValue(params.search);
  }, [params.search]);

  useEffect(() => {
    // If the update was triggered by the user, dispatch the search action.
    if (isUserUpdate.current) {
      debouncedSearch(searchValue);
      isUserUpdate.current = false; // Reset the flag after dispatching.
    }
  }, [searchValue, debouncedSearch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    isUserUpdate.current = true; // Set the flag to true when the user updates the value.
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
