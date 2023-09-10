import React from 'react';
import { CsvElementRow, RowCell } from './TableRow.styled';
import { CsvFileElement } from '../../../../api/types';
import moment from 'moment';
import LoupeImage from '../../../../../img/body/list/loupe.png';
import { Popup } from 'semantic-ui-react';

type Props = {
  counter: number;
  fileElement: CsvFileElement;
  statusIcon: string;
};

export const TableRow: React.FC<Props> = ({ fileElement, counter, statusIcon }) => {
  const {
    original_file_name: fileName,
    created,
    file_row_count: fileRowsCount,
    status,
    source_original_file_name: sourceFileName,
    enrich_detail,
  } = fileElement;

  return (
    <CsvElementRow>
      <RowCell centred={true}>
        <p>{counter}</p>
      </RowCell>
      <RowCell pointer={true}>
        <img src={LoupeImage} alt={'loupe'} />
        <p>{fileName || '...'}</p>
      </RowCell>
      <RowCell>
        <p>{moment(created).format('YYYY-MM-DD')}</p>
        <p className={'padding-left'}>{moment(created).format('HH:mm')}</p>
      </RowCell>
      <RowCell centred={true} pointer={true}>
        <Popup
          content={'test test test'}
          inverted
          mouseEnterDelay={100}
          position={'top center'}
          size='mini'
          trigger={<img src={statusIcon} alt={status} />}
        />
      </RowCell>
      <RowCell centred={!sourceFileName} pointer={true}>
        {!!sourceFileName && <img src={LoupeImage} alt={'loupe'} />}
        <p>{sourceFileName}</p>
      </RowCell>
      <RowCell centred={!enrich_detail}>
        <p>{enrich_detail?.external_url}</p>
      </RowCell>
      <RowCell centred={true} pointer={true}>
        <p>goto</p>
      </RowCell>
    </CsvElementRow>
  );
};
