import React from 'react';
import { CsvElementRow, RowCell } from './TableRow.styled';
import { CsvFileElement } from '../../../../api/types';
import moment from 'moment';
import LoupeImage from '../../../../../img/body/list/loupe.png';
import MaximizeImage from '../../../../../img/body/list/maximize.png';
import PreviewImage from '../../../../../img/body/list/preview.png';
import { Popup } from 'semantic-ui-react';
import { TableRowStatusDetails } from './types';
import { Link } from 'react-router-dom';

type Props = {
  counter: number;
  fileElement: CsvFileElement;
  statusDetail: TableRowStatusDetails;
};

export const TableRow: React.FC<Props> = ({ fileElement, counter, statusDetail }) => {
  const {
    uuid,
    original_file_name: fileName,
    created,
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
      <RowCell column={true}>
        <p>{moment(created).format('HH:mm')}</p>
        <p className={'padding-left'}>{moment(created).format('YYYY-MM-DD')}</p>
      </RowCell>
      <RowCell centred={true} pointer={true}>
        <Popup
          content={statusDetail.popupText}
          inverted
          mouseEnterDelay={100}
          position={'top center'}
          size='mini'
          trigger={<img src={statusDetail.imgSrc} alt={status} />}
        />
      </RowCell>
      <RowCell centred={!sourceFileName}>
        {!!sourceFileName && <img src={MaximizeImage} alt={'maximize'} />}
        <Link to={{ pathname: '/', search: `search=${uuid}` }} target='_blank'>
          <p>{sourceFileName}</p>
        </Link>
      </RowCell>
      <RowCell centred={!enrich_detail}>
        <p>{enrich_detail?.external_url}</p>
      </RowCell>
      <RowCell centred={true} pointer={true}>
        <img className={'preview'} src={PreviewImage} alt={'preview'} />
      </RowCell>
    </CsvElementRow>
  );
};
