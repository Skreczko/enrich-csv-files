import React from 'react';
import { DetailElementWrapper, DetailRow } from './TableRowDetailSection.styled';

export const TableRowDetailSourceFile: React.FC = () => (
  <DetailElementWrapper>
    <h5>Source file details</h5>
    <DetailRow>
      <p>id</p>
      <p>39c0ad10-a4dd-4c7e-aa57-755d224af7f9</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      <p>20mb</p>
    </DetailRow>
    <DetailRow>
      <p>file rows</p>
      <p>3000 file_row_count</p>
    </DetailRow>
    <DetailRow>
      <p>file headers</p>
      <p>file_headers</p>
    </DetailRow>
    <DetailRow>
      <p>file headers</p>
      <p>file_headers</p>
    </DetailRow>
    <DetailRow>
      <p>enrichment selected header</p>
      <p>selected_header</p>
    </DetailRow>
  </DetailElementWrapper>
);
