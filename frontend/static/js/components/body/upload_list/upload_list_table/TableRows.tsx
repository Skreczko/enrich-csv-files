import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { NoRecordWrapper } from './TableRows.styled';
import SandClockImage from '../../../../../img/body/list/sand-clock.png';
import { TableRow } from './TableRow';
import SuccessImage from '../../../../../img/notification/success.png';
import { EnrichDetailStatus } from '../../../../api/enums';
import { TableRowStatusDetails } from './types';
import { errorColor, warningColor } from '../../../../App.styled';
import { TableRowStatusEnum } from './enums';
import { FileListState } from '../../../../redux/FileListSlice';
import { TableModals } from './table_modals/TableModals';

export const statusDetails: Record<EnrichDetailStatus, TableRowStatusDetails> = {
  [EnrichDetailStatus.FETCHING_RESPONSE]: {
    popupText: 'Retrieving data from the provided URL.',
    progress: 10,
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
    popupText: 'The provided URL returned empty data or URL JSON root path is wrong.',
    progress: 30,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.AWAITING_COLUMN_SELECTION]: {
    backgroundColor: warningColor,
    popupText: 'Enrichment is pending. Specify columns to merge.',
    progress: 50,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_COLUMN_SELECTION]: {
    backgroundColor: errorColor,
    popupText: 'Column selection failed.',
    progress: 60,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.ENRICHING]: {
    popupText: 'CSV file is being enriched.',
    progress: 80,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.FAILED_ENRICHING]: {
    backgroundColor: errorColor,
    popupText:
      'Enrichment failed. Please check the file details for possible errors, or contact support for assistance.',
    progress: 90,
    type: TableRowStatusEnum.PROGRESS,
  },
  [EnrichDetailStatus.COMPLETED]: {
    imgSrc: SuccessImage,
    popupText: 'CSV file is ready.',
    type: TableRowStatusEnum.ICON,
  },
};

export const TableRows: React.FC = () => {
  const { fileList, paginator }: FileListState = useSelector((state: RootState) => state.fileList);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEnrichStep1Modal, setOpenEnrichStep1Modal] = useState(false);
  const [openEnrichStep2Modal, setOpenEnrichStep2Modal] = useState(false);
  const [selectedCsvFileElementUuid, setSelectedCsvFileElementUuid] = useState<string>(null);

  const selectedFileElement = fileList?.find(
    csvFileElement => csvFileElement.uuid === selectedCsvFileElementUuid,
  );

  const getFileIndex = (index: number): number => {
    return index + (paginator.page - 1) * paginator.page_size;
  };
  return (
    <div data-testid={'table-rows'}>
      {fileList?.length ? (
        <>
          {fileList.map((fileElement, index) => (
            <TableRow
              key={fileElement.uuid}
              fileElement={fileElement}
              counter={getFileIndex(index) + 1}
              statusDetail={statusDetails[fileElement.status]}
              onOpenDeleteModal={(): void => {
                setSelectedCsvFileElementUuid(fileElement.uuid);
                setOpenDeleteModal(true);
              }}
              onOpenEnrichStep1Modal={(): void => {
                setSelectedCsvFileElementUuid(fileElement.uuid);
                setOpenEnrichStep1Modal(true);
              }}
              onOpenEnrichStep2Modal={(): void => {
                setSelectedCsvFileElementUuid(fileElement.uuid);
                setOpenEnrichStep2Modal(true);
              }}
            />
          ))}
          {selectedCsvFileElementUuid && (
            <TableModals
              selectedFileElement={selectedFileElement}
              onCloseDeleteModal={(): void => setOpenDeleteModal(false)}
              onCloseEnrichStep1Modal={(): void => setOpenEnrichStep1Modal(false)}
              onCloseEnrichStep2Modal={(): void => setOpenEnrichStep2Modal(false)}
              openDeleteModal={openDeleteModal}
              openEnrichStep1Modal={openEnrichStep1Modal}
              openEnrichStep2Modal={openEnrichStep2Modal}
            />
          )}
        </>
      ) : (
        <NoRecordWrapper data-testid={'no-record'}>
          <img src={SandClockImage} alt={'sand-clock'} />
          <p>There are no uploaded files yet</p>
        </NoRecordWrapper>
      )}
    </div>
  );
};
