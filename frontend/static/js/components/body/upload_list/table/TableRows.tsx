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

const statusDetails: Record<EnrichDetailStatus, TableRowStatusDetails> = {
  [EnrichDetailStatus.FETCHING_RESPONSE]: {
    progress: 20,
    popupText: 'Retrieving data from the provided URL.',
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE]: {
    backgroundColor: errorColor,
    progress: 30,
    popupText: 'Fetch error. Ensure the URL you provided returns a valid JSON response.',
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS]: {
    backgroundColor: errorColor,
    progress: 30,
    popupText:
      "Fetch error. Communication issue with the provided URL's server. Please try again later.",
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION]: {
    backgroundColor: errorColor,
    progress: 30,
    popupText:
      'Fetch error. An issue occurred during the fetch. Please contact support or try again later.',
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_NOT_JSON]: {
    backgroundColor: errorColor,
    progress: 30,
    popupText: 'Fetch error. The provided URL does not return JSON data.',
  },
  [EnrichDetailStatus.FAILED_FETCHING_RESPONSE_EMPTY_JSON]: {
    backgroundColor: errorColor,
    progress: 30,
    popupText: 'The provided URL returned empty data.',
  },
  [EnrichDetailStatus.AWAITING_COLUMN_SELECTION]: {
    backgroundColor: warningColor,
    progress: 50,
    popupText: 'Enrichment is pending. Open details and specify columns to merge.',
  },
  [EnrichDetailStatus.FAILED_COLUMN_SELECTION]: {
    backgroundColor: errorColor,
    progress: 10,
    popupText: 'Column selection failed.',
  },
  [EnrichDetailStatus.ENRICHING]: {
    progress: 80,
    popupText: 'CSV file is being enriched.',
  },
  [EnrichDetailStatus.FAILED_ENRICHING]: {
    backgroundColor: errorColor,
    progress: 90,
    popupText: 'Enrichment failed. Please contact support for assistance.',
  },
  [EnrichDetailStatus.COMPLETED]: {
    imgSrc: SuccessImage,
    popupText: 'CSV file is ready to preview',
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
