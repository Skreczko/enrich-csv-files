import React from 'react';
import { TableHeaderCell, TableHeaderWrapper } from './TableHeader.styled';

export const columns: string[] = [
  '#',
  'csv file',
  'created',
  'status',
  'source csv file',
  'enrichment url',
  'actions',
];

export const TableHeader: React.FC = () => (
  <TableHeaderWrapper>
    {columns.map(column => (
      <TableHeaderCell data-testid={'table-header'} key={column.replace(/\s/g, '-')}>
        {column}
      </TableHeaderCell>
    ))}
  </TableHeaderWrapper>
);
