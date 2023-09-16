import React from 'react';
import { DetailWrapper } from './TableRowDetailSection.styled';
import { TableRowDetailEnrichUrl } from './TableRowDetailEnrichUrl';
import { TableRowDetailFile } from './TableRowDetailFile';

export const TableRowDetailSection: React.FC = () => (
  <DetailWrapper>
    <TableRowDetailFile />
    <TableRowDetailEnrichUrl />
  </DetailWrapper>
);
