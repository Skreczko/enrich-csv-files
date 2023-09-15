import React from 'react';
import { SearchInput } from './SearchInput';
import { Sorting } from './Sorting';
import { Filters } from './Filters';
import { ListManagementWrapper } from './ListManagement.styled';

export const ListManagement: React.FC = () => (
  <ListManagementWrapper>
    <SearchInput />
    <Sorting />
    <Filters />
  </ListManagementWrapper>
);
