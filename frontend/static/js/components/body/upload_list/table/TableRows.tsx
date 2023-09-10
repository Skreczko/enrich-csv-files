import React, { useCallback } from 'react';
import { FileListState } from '../../../../redux/FileListSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { NoRecordWrapper } from './TableRows.styled';
import SandClockImage from '../../../../../img/body/list/sand-clock.png';
import { TableRow } from './TableRow';
import WarningImage from '../../../../../img/notification/warning.png';
import SuccessImage from '../../../../../img/notification/success.png';
import ErrorImage from '../../../../../img/notification/error.png';
import { EnrichDetailStatus } from '../../../../api/enums';

export const TableRows: React.FC = () => {
  const { fileList }: FileListState = useSelector((state: RootState) => state.fileList);

  const getImageByStatus = useCallback(
    (status: EnrichDetailStatus): string => {
      switch (status) {
        case EnrichDetailStatus.FINISHED:
          return SuccessImage;
        case EnrichDetailStatus.FAILED:
          return ErrorImage;
        case EnrichDetailStatus.IN_PROGRESS:
          return ErrorImage;  //todo
        case EnrichDetailStatus.INITIATED:
          return WarningImage;
        default: {
          return '';
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
            statusIcon={getImageByStatus(fileElement.status)}
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
