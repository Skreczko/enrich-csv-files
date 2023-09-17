import React from 'react';
import { DetailElementWrapper, DetailRow } from './TableRowDetailSection.styled';
import {EnrichmentJoinType, FileDetail} from '../../../../api/types';

type Props = {
  // fileHeader: string[];
  // joinType?: EnrichmentJoinType;
  // size: string;
  uuid: string;
  file: FileDetail;
};

export const TableRowDetailFile: React.FC<Props> = ({
  uuid,
  file
                                                    }) => (
  <DetailElementWrapper>
    <h5>File details</h5>
    <DetailRow>
      <p>id</p>
      <p>{uuid}</p>
    </DetailRow>
      <DetailRow>
      <p>file name</p>
      <p>{fileSize}</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      <p>{fileSize}</p>
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
      <p>join type</p>
      <p>join_type</p>
    </DetailRow>
    <DetailRow>
      <p>enrichment selected header</p>
      <p>selected_header</p>
    </DetailRow>
    <DetailRow>
      <p>enrichment selected key</p>
      <p>selected_header</p>
    </DetailRow>
    <DetailRow>
      <p>flatten</p>
      <p>is_flat</p>
    </DetailRow>
  </DetailElementWrapper>
);
