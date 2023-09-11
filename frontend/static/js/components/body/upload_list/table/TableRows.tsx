import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { NoRecordWrapper } from './TableRows.styled';
import SandClockImage from '../../../../../img/body/list/sand-clock.png';
import { TableRow } from './TableRow';
import WarningImage from '../../../../../img/notification/warning.png';
import SuccessImage from '../../../../../img/notification/success.png';
import ErrorImage from '../../../../../img/notification/error.png';
import LoadingImage from '../../../../../img/notification/loading.png';
import { EnrichDetailStatus } from '../../../../api/enums';
import { TableRowStatusDetails } from './types';
import { CsvFileElement } from '../../../../api/types';

export const TableRows: React.FC = () => {
  const fileList: CsvFileElement[] = useSelector((state: RootState) => state.fileList.fileList);

  const getImageByStatus = useCallback(
    (status: EnrichDetailStatus): TableRowStatusDetails => {
      switch (status) {
        case EnrichDetailStatus.FINISHED:
          return {
            imgSrc: SuccessImage,
            popupText: 'The file has been successfully uploaded and processed.',
          };
        case EnrichDetailStatus.FAILED:
          return {
            imgSrc: ErrorImage,
            popupText: 'Processing failed. See file details for more information.',
          };
        case EnrichDetailStatus.IN_PROGRESS:
          return { imgSrc: LoadingImage, popupText: 'The file is currently being processed.' };
        case EnrichDetailStatus.INITIATED:
          return {
            imgSrc: WarningImage,
            popupText:
              'Enrichment is pending for this file. Open details and specify the columns to merge.',
          };
        default: {
          return { imgSrc: '', popupText: '' };
        }
      }
    },
    [fileList],
  );

  return (
    <div>
      {fileList?.length ? (
        fileList.map((fileElement, index) => (
          <TableRow
            key={fileElement.uuid}
            fileElement={fileElement}
            counter={index + 1}
            statusDetail={getImageByStatus(fileElement.status)}
          />
        ))
      ) : (
        <NoRecordWrapper>
          <img src={SandClockImage} alt={'sand-clock'} />
          <p>There are no uploaded files yet</p>
        </NoRecordWrapper>
      )}
    </div>
  );
};
