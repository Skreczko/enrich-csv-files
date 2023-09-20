import React, { useState } from 'react';
import { CsvFileElement, EnrichFileRequest } from '../../../../../api/types';
import { DeleteModal } from './DeleteModal';
import { EnrichStep1Modal } from './EnrichStep1Modal';
import { EnrichJsonRootPathInfoModal } from './EnrichJsonRootPathInfoModal';
import { EnrichStep2Modal } from './EnrichStep2Modal';
import { deleteUploadFile, enrichFile, fetchExternalUrlJson } from '../../../../../api/actions';
import { setNotificationPopupOpen } from '../../../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../../../notification/NotificationPopup';
import { generateHTMLErrorMessages, truncateString } from '../../../../notification/helpers';
import { setTask } from '../../../../../redux/TaskListReducer';
import { useFetchUploadList } from '../../../../hooks/useFetchUploadList';
import { useDispatch } from 'react-redux';
import { EnrichJsonJoinTypeInfoModal } from './EnrichJsonJoinTypeInfoModal';
import { EnrichJsonFlattenStructureInfoModal } from './EnrichJsonFlattenStructureInfoModal';

type Props = {
  selectedFileElement: CsvFileElement;
  openDeleteModal: boolean;
  onCloseDeleteModal: () => void;
  openEnrichStep1Modal: boolean;
  openEnrichStep2Modal: boolean;
  onCloseEnrichStep1Modal: () => void;
  onCloseEnrichStep2Modal: () => void;
};

export const TableModals: React.FC<Props> = ({
  selectedFileElement,
  openDeleteModal,
  onCloseDeleteModal,
  openEnrichStep1Modal,
  onCloseEnrichStep1Modal,
  openEnrichStep2Modal,
  onCloseEnrichStep2Modal,
}) => {
  const dispatch = useDispatch();
  const fetchListData = useFetchUploadList();
  const [openEnrichJsonRootPathInfoModal, setOpenEnrichJsonRootPathInfoModal] = useState(false);
  const [openEnrichJsonJoinTypeInfoModal, setOpenEnrichJsonJoinTypeInfoModal] = useState(false);
  const [
    openEnrichJsonFlattenStructureInfoModal,
    setOpenEnrichJsonFlattenStructureInfoModal,
  ] = useState(false);

  const onDeleteAction = async (): Promise<void> => {
    const uuid = selectedFileElement.uuid;
    const fileName = selectedFileElement.original_file_name;
    try {
      await deleteUploadFile(selectedFileElement.uuid);
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

    fetchListData();
  };

  const onEnrichStep1Action = async (enrichUrl: string, jsonRootPath: string): Promise<void> => {
    try {
      const { task_id, csv_file_uuid } = await fetchExternalUrlJson(
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

  const onEnrichStep2Action = async (
    params: Omit<EnrichFileRequest, 'enrichDetailUuid'>,
  ): Promise<void> => {
    try {
      const { task_id, csv_file_uuid } = await enrichFile({
        enrichDetailUuid: selectedFileElement.enrich_detail.uuid,
        ...params,
      });
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
      // fetchListData();
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
    <>
      {openDeleteModal && (
        <DeleteModal
          onAction={onDeleteAction}
          onClose={onCloseDeleteModal}
          open={openDeleteModal}
          selectedFileElement={selectedFileElement}
        />
      )}
      {openEnrichStep1Modal && (
        <EnrichStep1Modal
          onAction={onEnrichStep1Action}
          onClose={onCloseEnrichStep1Modal}
          onOpenEnrichJsonRootPathModal={(): void => setOpenEnrichJsonRootPathInfoModal(true)}
          open={openEnrichStep1Modal}
          selectedFileElement={selectedFileElement}
        />
      )}
      {openEnrichJsonRootPathInfoModal && (
        <EnrichJsonRootPathInfoModal
          onClose={(): void => setOpenEnrichJsonRootPathInfoModal(false)}
          open={openEnrichJsonRootPathInfoModal}
        />
      )}
      {openEnrichStep2Modal && (
        <EnrichStep2Modal
          onAction={onEnrichStep2Action}
          onClose={onCloseEnrichStep2Modal}
          open={openEnrichStep2Modal}
          selectedFileElement={selectedFileElement}
          setOpenJoinTypeModal={(): void => setOpenEnrichJsonJoinTypeInfoModal(true)}
          setOpenFlattenStructureModal={(): void =>
            setOpenEnrichJsonFlattenStructureInfoModal(true)
          }
        />
      )}
      {openEnrichJsonJoinTypeInfoModal && (
        <EnrichJsonJoinTypeInfoModal
          onClose={(): void => setOpenEnrichJsonJoinTypeInfoModal(false)}
          open={openEnrichJsonJoinTypeInfoModal}
        />
      )}
      {openEnrichJsonFlattenStructureInfoModal && (
        <EnrichJsonFlattenStructureInfoModal
          onClose={(): void => setOpenEnrichJsonFlattenStructureInfoModal(false)}
          open={openEnrichJsonFlattenStructureInfoModal}
        />
      )}
    </>
  );
};
