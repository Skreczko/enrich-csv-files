import React, { useState } from 'react';
import { CsvElementRow, PopupTrigger, TableCell, TableRowWrapper } from './TableRow.styled';
import { CsvFileElement } from '../../../../api/types';
import moment from 'moment';
import LoupeImage from '../../../../../img/body/list/loupe.png';
import MaximizeImage from '../../../../../img/body/list/maximize.png';
import { Popup } from 'semantic-ui-react';
import { TableRowStatusDetails } from './types';
import { Link } from 'react-router-dom';
import { ProgressBar, ProgressBarFiller } from '../../upload_csv/UploadedFileListRowDetail.styled';
import { lightGrey } from '../../../../App.styled';
import { TableRowDetailSection } from './TableRowDetailSection';
import { TableCellActions } from './TableCellActions';

export type TableRowProps = {
  counter: number;
  fileElement: CsvFileElement;
  onOpenDeleteModal: () => void;
  onOpenEnrichStep1Modal: () => void;
  onOpenEnrichStep2Modal: () => void;
  statusDetail: TableRowStatusDetails;
};

export const TableRow: React.FC<TableRowProps> = ({
  counter,
  fileElement,
  onOpenDeleteModal,
  onOpenEnrichStep1Modal,
  onOpenEnrichStep2Modal,
  statusDetail,
}) => {
  const [openDetails, setOpenDetails] = useState(false);

  const {
    uuid,
    original_file_name: fileName,
    created,
    source_original_file_name: sourceFileName,
    status,
    enrich_detail,
  } = fileElement;

  return (
    <TableRowWrapper data-testid={'table-row'}>
      <CsvElementRow>
        <TableCell data-testid={'table-cell'} centred={true}>
          <p>{counter}</p>
        </TableCell>
        <TableCell
          data-testid={'table-cell'}
          pointer={true}
          paddingLeft={10}
          onClick={(): void => setOpenDetails(!openDetails)}
        >
          <img src={LoupeImage} alt={'loupe'} />
          <p>{fileName || '...'}</p>
        </TableCell>
        <TableCell data-testid={'table-cell'} column={true}>
          <p>{moment(created).format('HH:mm')}</p>
          <p className={'padding-left'}>{moment(created).format('YYYY-MM-DD')}</p>
        </TableCell>
        <Popup
          content={statusDetail.popupText}
          inverted
          mouseEnterDelay={50}
          position={'top center'}
          size='mini'
          trigger={
            <TableCell data-testid={'table-cell'} centred={true} pointer={true}>
              <PopupTrigger>
                {'imgSrc' in statusDetail && (
                  <img data-testid={'status-icon'} src={statusDetail.imgSrc} alt={status} />
                )}
                {'progress' in statusDetail && (
                  <ProgressBar
                    data-testid={'status-progress-bar'}
                    height={10}
                    backgroundColor={lightGrey}
                  >
                    <ProgressBarFiller
                      width={statusDetail.progress}
                      backgroundColor={statusDetail.backgroundColor}
                    />
                  </ProgressBar>
                )}
              </PopupTrigger>
            </TableCell>
          }
        />
        <TableCell data-testid={'table-cell'} paddingLeft={10} pointer={!sourceFileName}>
          {!!sourceFileName && <img src={MaximizeImage} alt={'maximize'} />}
          <Link to={{ pathname: '/', search: `search=${uuid}` }} target='_blank'>
            <p>{sourceFileName}</p>
          </Link>
        </TableCell>
        <TableCell data-testid={'table-cell'} paddingLeft={10}>
          <p>{enrich_detail?.external_url}</p>
        </TableCell>
        <TableCellActions
          onOpenDeleteModal={onOpenDeleteModal}
          onOpenEnrichStep1Modal={onOpenEnrichStep1Modal}
          onOpenEnrichStep2Modal={onOpenEnrichStep2Modal}
          status={status}
          uuid={fileElement.uuid}
        />
      </CsvElementRow>
      {openDetails && <TableRowDetailSection fileElement={fileElement} />}
    </TableRowWrapper>
  );
};
