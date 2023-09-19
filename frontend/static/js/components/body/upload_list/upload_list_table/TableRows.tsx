import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { generateHTMLErrorMessages, truncateString } from '../../../notification/helpers';
import { deleteUploadFile, enrichFile } from '../../../../api/actions';
import { setNotificationPopupOpen } from '../../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../../notification/NotificationPopup';
import { useFetchUploadList } from '../../../hooks/useFetchUploadList';
import { CsvFileElement } from '../../../../api/types';
import { TableModals } from './table_modals/TableModals';
import { setTask } from '../../../../redux/TaskListReducer';

const statusDetails: Record<EnrichDetailStatus, TableRowStatusDetails> = {
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
    popupText: 'Enrichment failed. Please contact support for assistance.',
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
  const dispatch = useDispatch();
  const fetchListData = useFetchUploadList();

  const { fileList, paginator }: FileListState = useSelector((state: RootState) => state.fileList);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEnrichModal, setOpenEnrichModal] = useState(false);
  const [selectedFileElement, setSelectedFileElement] = useState<CsvFileElement>(null);

  const getFileIndex = (index: number): number => {
    return index + (paginator.page - 1) * paginator.page_size;
  };

  const onDeleteAction = async ({
    uuid,
    original_file_name: fileName,
  }: CsvFileElement): Promise<void> => {
    try {
      await deleteUploadFile(uuid);
      dispatch(
        setNotificationPopupOpen({
          appearance: NotificationAppearanceEnum.SUCCESS,
          content: `File ${truncateString(fileName, 100)} (${uuid}) has been deleted.`,
        }),
      );
    } catch (e) {
      dispatch(
        setNotificationPopupOpen({
          appearance: NotificationAppearanceEnum.ERROR,
          content: 'An error occurred during the upload process',
          additionalContent: generateHTMLErrorMessages(
            e.response.data.error,
            truncateString(fileName, 100),
          ),
          permanent: true,
        }),
      );
    }
    console.log(2);
    fetchListData();
  };

  const onEnrichAction = async (enrichUrl: string, jsonRootPath: string): Promise<void> => {
    try {
      const { task_id, csv_file_uuid } = await enrichFile(
        selectedFileElement.uuid,
        enrichUrl,
        jsonRootPath,
      );
      dispatch(
        setNotificationPopupOpen({
          appearance: NotificationAppearanceEnum.INFO,
          content: `Enrichment in process for file ${truncateString(
            selectedFileElement.original_file_name,
            100,
          )} (ID: ${selectedFileElement.uuid})`,
        }),
      );
      dispatch(setTask({ [task_id]: { instance: 'CsvFile', uuid: csv_file_uuid } }));
      console.log(3);
      fetchListData();
    } catch (e) {
      dispatch(
        setNotificationPopupOpen({
          appearance: NotificationAppearanceEnum.ERROR,
          content: 'An error occurred during the enrichment process',
          additionalContent: generateHTMLErrorMessages(
            e.response.data.error,
            truncateString(selectedFileElement.original_file_name, 100),
          ),
          permanent: true,
        }),
      );
    }
  };

  return (
    <div>
      {fileList?.length ? (
        <>
          {fileList.map((fileElement, index) => (
            <TableRow
              key={fileElement.uuid}
              fileElement={fileElement}
              counter={getFileIndex(index) + 1}
              statusDetail={statusDetails[fileElement.status]}
              onOpenDeleteModal={(): void => {
                setSelectedFileElement(fileElement);
                setOpenDeleteModal(true);
              }}
              onOpenEnrichModal={(): void => {
                setSelectedFileElement(fileElement);
                setOpenEnrichModal(true);
              }}
            />
          ))}
          <TableModals
            selectedFileElement={selectedFileElement}
            openDeleteModal={openDeleteModal}
            onCloseDeleteModal={(): void => setOpenDeleteModal(false)}
            onDeleteAction={(): Promise<void> => onDeleteAction(selectedFileElement)}
            openEnrichModal={openEnrichModal}
            onCloseEnrichModal={(): void => setOpenEnrichModal(false)}
            onEnrichAction={(enrichUrl: string, jsonRootPath: string): Promise<void> =>
              onEnrichAction(enrichUrl, jsonRootPath)
            }
          />
        </>
      ) : (
        <NoRecordWrapper>
          <img src={SandClockImage} alt={'sand-clock'} />
          <p>There are no uploaded files yet</p>
        </NoRecordWrapper>
      )}
    </div>
  );
};
