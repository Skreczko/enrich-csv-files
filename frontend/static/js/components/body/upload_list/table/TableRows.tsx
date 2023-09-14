import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { NoRecordWrapper } from './TableRows.styled';
import SandClockImage from '../../../../../img/body/list/sand-clock.png';
import { TableRow } from './TableRow';
import SuccessImage from '../../../../../img/notification/success.png';
import { EnrichDetailStatus } from '../../../../api/enums';
import { TableRowStatusDetails } from './types';
import { CsvFileElement } from '../../../../api/types';
import { errorColor, warningColor } from '../../../../App.styled';
import { TableRowStatusEnum } from './enums';

const statusDetails: Record<EnrichDetailStatus, TableRowStatusDetails> = {
  [EnrichDetailStatus.FETCHING_RESPONSE]: {
    popupText: 'Retrieving data from the provided URL.',
    progress: 20,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE]: {
    backgroundColor: errorColor,
    popupText: 'Fetch error. Ensure the URL you provided returns a valid JSON response.',
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS]: {
    backgroundColor: errorColor,
    popupText:
      "Fetch error. Communication issue with the provided URL's server. Please try again later.",
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION]: {
    backgroundColor: errorColor,
    popupText:
      'Fetch error. An issue occurred during the fetch. Please contact support or try again later.',
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_NOT_JSON]: {
    backgroundColor: errorColor,
    popupText: 'Fetch error. The provided URL does not return JSON data.',
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_EMPTY_JSON]: {
    backgroundColor: errorColor,
    popupText: 'The provided URL returned empty data.',
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.AWAITING_COLUMN_SELECTION]: {
    backgroundColor: warningColor,
    popupText: 'Enrichment is pending. Open details and specify columns to merge.',
    progress: 50,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_COLUMN_SELECTION]: {
    backgroundColor: errorColor,
    popupText: 'Column selection failed.',
    progress: 10,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.ENRICHING]: {
    popupText: 'CSV file is being enriched.',
    progress: 80,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_ENRICHING]: {
    backgroundColor: errorColor,
    popupText: 'Enrichment failed. Please contact support for assistance.',
    progress: 90,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.COMPLETED]: {
    imgSrc: SuccessImage,
    popupText: 'CSV file is ready to preview',
    type: TableRowStatusEnum.ICON,
  },
};

export const TableRows: React.FC = () => {
  const fileList: CsvFileElement[] = useSelector((state: RootState) => state.fileList.fileList);

  return (
    <div>
      {fileList?.length ? (
        fileList.map((fileElement, index) => (
          <TableRow
            key={fileElement.uuid}
            fileElement={fileElement}
            counter={index + 1}
            statusDetail={statusDetails[fileElement.status]}
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
