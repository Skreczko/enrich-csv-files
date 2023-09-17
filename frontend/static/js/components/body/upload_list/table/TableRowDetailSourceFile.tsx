import React from 'react';
import { DetailElementWrapper, DetailRow } from './TableRowDetailSection.styled';
import { FileDetail } from '../../../../api/types';
import moment from 'moment';

type Props = {
  created: string;
  file: FileDetail;
  fileHeaders: string[];
  fileName: string;
  fileRows: number;
  uuid: string;
};

export const TableRowDetailSourceFile: React.FC<Props> = ({
  created,
  file,
  fileHeaders,
  fileName,
  fileRows,
  uuid,
}) => (
  <DetailElementWrapper>
    <h5>Source file details</h5>
    <DetailRow>
      <p>id</p>
      <p className={'text-transform-none'}>{uuid}</p>
    </DetailRow>
    <DetailRow>
      <p>created</p>
      <p className={'text-transform-none'}>{moment(created).format('HH:mm YYYY-MM-DD')}</p>
    </DetailRow>
    <DetailRow>
      <p>file name</p>
      <p className={'text-transform-none'}>{fileName}</p>
    </DetailRow>
    <DetailRow>
      <p>size</p>
      <p className={'text-transform-none'}>{(file?.size / 1024 ** 2).toFixed(2)} MB</p>
    </DetailRow>
    <DetailRow>
      <p>file headers</p>
      <p className={'text-transform-none'}>{fileHeaders.join(', ')}</p>
    </DetailRow>
    <DetailRow>
      <p>file rows</p>
      <p className={'text-transform-none'}>{fileRows}</p>
    </DetailRow>
  </DetailElementWrapper>
);
