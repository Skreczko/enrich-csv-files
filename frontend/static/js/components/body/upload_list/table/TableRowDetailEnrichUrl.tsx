import React from 'react';
import { DetailElementWrapper, DetailRow } from './TableRowDetailSection.styled';

export const TableRowDetailEnrichUrl: React.FC = () => (
  <DetailElementWrapper>
    <DetailRow>
      <p>id</p>
      <p>39c0ad10-a4dd-4c7e-aa57-755d224af7f9</p>
    </DetailRow>
    <DetailRow>
      <p>saved url response</p>
      <p>external_response</p>
    </DetailRow>
    <DetailRow>
      <p>response elements</p>
      <p>3000 external_elements_count</p>
    </DetailRow>
    <DetailRow>
      <p>join type</p>
      <p>join_type</p>
    </DetailRow>
    <DetailRow>
      <p>flatten</p>
      <p>is_flat</p>
    </DetailRow>
    <DetailRow>
      <p>response keys</p>
      <p>is_flat</p>
    </DetailRow>
    <DetailRow>
      <p>enrichment selected key</p>
      <p>selected_header</p>
    </DetailRow>
  </DetailElementWrapper>
);
