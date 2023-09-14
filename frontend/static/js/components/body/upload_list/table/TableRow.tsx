import React from 'react';
import { CsvElementRow, PopupTrigger, RowCell } from './TableRow.styled';
import { CsvFileElement } from '../../../../api/types';
import moment from 'moment';
import LoupeImage from '../../../../../img/body/list/loupe.png';
import MaximizeImage from '../../../../../img/body/list/maximize.png';
import PreviewImage from '../../../../../img/body/list/preview.png';
import DeleteImage from '../../../../../img/body/list/delete-red.png';
import { Popup } from 'semantic-ui-react';
import { TableRowStatusDetails } from './types';
import { Link } from 'react-router-dom';
import { ProgressBar, ProgressBarFiller } from '../../upload/UploadedFileListRowDetail.styled';
import { EnrichDetailStatus } from '../../../../api/enums';
import { lightGrey } from '../../../../App.styled';

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
    source_original_file_name: sourceFileName,
    status,
    enrich_detail,
  } = fileElement;

  const showPreview = (status: EnrichDetailStatus): boolean => {
    return status === EnrichDetailStatus.COMPLETED;
  };

  return (
    <CsvElementRow>
      <RowCell centred={true}>
        <p>{counter}</p>
      </RowCell>
      <RowCell pointer={true} paddingLeft={10}>
        <img src={LoupeImage} alt={'loupe'} />
        <p>{fileName || '...'}</p>
      </RowCell>
      <RowCell column={true}>
        <p>{moment(created).format('HH:mm')}</p>
        <p className={'padding-left'}>{moment(created).format('YYYY-MM-DD')}</p>
      </RowCell>

      <Popup
        content={statusDetail.popupText}
        inverted
        mouseEnterDelay={50}
        position={'top center'}
        size='mini'
        trigger={
          <RowCell centred={true} pointer={true}>
            <PopupTrigger>
              {'imgSrc' in statusDetail && <img src={statusDetail.imgSrc} alt={status} />}
              {'progress' in statusDetail && (
                <ProgressBar height={10} backgroundColor={lightGrey}>
                  <ProgressBarFiller
                    width={statusDetail.progress}
                    backgroundColor={statusDetail.backgroundColor}
                  />
                </ProgressBar>
              )}
            </PopupTrigger>
          </RowCell>
        }
      />

      <RowCell paddingLeft={10} pointer={!sourceFileName}>
        {!!sourceFileName && <img src={MaximizeImage} alt={'maximize'} />}
        <Link to={{ pathname: '/', search: `search=${uuid}` }} target='_blank'>
          <p>{sourceFileName}</p>
        </Link>
      </RowCell>
      <RowCell paddingLeft={10}>
        <p>{enrich_detail?.external_url}</p>
      </RowCell>
      <RowCell>
        <div className={'actions'}>
          {showPreview(status) && <img className={'preview'} src={PreviewImage} alt={'preview'} />}
          <img className={'delete'} src={DeleteImage} alt={'delete'} />
        </div>
      </RowCell>
    </CsvElementRow>
  );
};
