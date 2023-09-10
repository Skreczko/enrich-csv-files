import React from 'react';
import { SearchInput } from './SearchInput';

export const columns: string[] = [
  'file name',
  'created',
  'rows',
  'source file name',
  'enriched by',
];

export const UploadListManagement: React.FC = () => (
  <div>
    <SearchInput />
    {/*<SortingSection />*/}
    {/*<FilterSection />*/}
  </div>
);
