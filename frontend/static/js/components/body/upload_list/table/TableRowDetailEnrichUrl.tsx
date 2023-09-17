import React from 'react';
import { DetailElementWrapper, DetailRow } from './TableRowDetailSection.styled';

export const TableRowDetailEnrichUrl: React.FC = () => (
  <DetailElementWrapper>
    <h5>External url details</h5>
    <DetailRow>
      <p>id</p>
      <p>39c0ad10-a4dd-4c7e-aa57-755d224af7f9</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      <p>20mb</p>
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
      <p>response keys</p>
      <p>response_keys</p>
    </DetailRow>

  </DetailElementWrapper>
);
