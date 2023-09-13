import React from 'react';
import { TableHeaderCell, TableHeaderWrapper } from './TableHeader.styled';

export const columns: string[] = [
  '#',
  'file name',
  'created',
  'status',
  'source file name',
  'enriched by',
  'actions',
];

export const TableHeader: React.FC = () => (
  <TableHeaderWrapper>
    {columns.map(column => (
      <TableHeaderCell key={column.replace(/\s/g, '-')}>{column}</TableHeaderCell>
    ))}
  </TableHeaderWrapper>
);
