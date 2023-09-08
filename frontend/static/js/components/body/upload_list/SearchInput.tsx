/* eslint-disable @typescript-eslint/no-var-requires */

import React, { useEffect } from 'react';
import styled from 'styled-components';

import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { FileListManagementType, setSearch } from '../../../redux/FileListManagementSlice';
import SearchImage from '../../../../img/body/list/search.png';
import { ApiAction, fetchUploadList } from '../../../api/actions';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100% !important;
  margin: 30px 0;
`;

const SearchIconWrapper = styled.div`
  height: 100%;
  background-color: #00e1ce;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 0 20px 20px 0;
  padding: 12px 20px;
  cursor: pointer;

  img {
    max-height: 23px;
  }
`;

const StyledInput = styled.input`
  color: #84b1b5;
  font-size: 14px;
  padding: 13px;
  border-radius: 20px 0 0 20px !important;
  width: 250px;
  max-width: 320px;
`;

export const SearchInput: React.FC = () => {
  const dispatch = useDispatch();
  const params: FileListManagementType = useSelector(
    (state: RootState) => state.fileListManagement,
  );

  useEffect(() => {
    fetchUploadList({ action: ApiAction.FETCH_UPLOAD_LIST, ...params });
  }, []);

  // const debouncedFetchPatientList = useCallback(_.debounce(dispatch(setSearch), 1000), []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.currentTarget;
    dispatch(setSearch(value));
  };

  return (
    <StyledDiv>
      <StyledInput
        type='text'
        placeholder='Search...'
        onChange={onChange}
        value={params.search}
      />
      <SearchIconWrapper>
        <img src={SearchImage} alt={'search'} />
      </SearchIconWrapper>
    </StyledDiv>
  );
};
