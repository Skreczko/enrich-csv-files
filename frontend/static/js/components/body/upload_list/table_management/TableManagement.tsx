import React from 'react';
import { SearchInput } from './SearchInput';
import { Sorting } from './Sorting';
import { Filters } from './Filters';
import { ListManagementWrapper } from './TableManagement.styled';

export const TableManagement: React.FC = () => (
  <ListManagementWrapper>
    <SearchInput />
    <Sorting />
    <Filters />
  </ListManagementWrapper>
);
