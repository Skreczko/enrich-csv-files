import React, { useEffect, useState } from 'react';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';
import { UploadFileSection, UploadFileWrapper } from './UploadFile.styled';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup.enums';
import { UploadedFileList } from './UploadedFileList';
import { upload_csv } from '../../../api/action';
import { v4 as uuidv4 } from 'uuid';
import {
  FileDetailsType,
  FileStatusEnum,
  setFileDetails,
  updateFileDetail,
} from '../../../redux/FileDetailsManagementSlice';
import { RootState } from '../../../redux/store';

export type FileType = FileDetailsType & { file: File };
type IncorrectFileDetailsType = {
  reason: string;
  file: File;
};
export enum UploadStateEnum {
  IN_ADDING = 'in_adding',
  SENDING = 'sending',
}

export const UploadFile: React.FC = () => {
  const dispatch = useDispatch();
  const [fileElements, setFileElements] = useState<FileType[]>([]);
  const [uploadState, setUploadState] = useState<UploadStateEnum>(UploadStateEnum.IN_ADDING);
  // true when user already uploaded files and "fileElements" state should be cleared before next use
  const [shouldClear, setShouldClear] = useState(false);

  useEffect(() => {
    // pushing to redux without "file" property
    dispatch(setFileDetails(fileElements.map(({ file, ...fileDetails }) => fileDetails)));
    // after click on "upload", we should clear fileElements for next use
    setShouldClear(false);
  }, [fileElements]);

  useEffect(() => {
    // setting uploading state
    (async (): Promise<void> => {
      if (uploadState === UploadStateEnum.SENDING) {
        await onFilesSend();
        setUploadState(UploadStateEnum.IN_ADDING);
        setShouldClear(true);
      }
    })();
  }, [uploadState]);

  const onFileRemove = (uuid: string): void => {
    setFileElements(prevFiles => prevFiles.filter(file => file.uuid !== uuid));
  };

  const setIncorrectFileNotification = (incorrectFilesList: IncorrectFileDetailsType[]): void => {
    const incorrectFileDetailsToHtml = incorrectFilesList
      .map(
        ({ file, reason }) =>
          `<div style="font-weight: bold">${file.name}</div><div>${reason}</div>`,
      )
      .join('');

    dispatch(
      setNotificationPopupOpen({
        appearance: NotificationAppearanceEnum.ERROR,
        content: 'An error occurred during the upload process',
        additionalContent: `<div style="display: grid; grid-template-columns: max-content 1fr; grid-column-gap: 30px">${incorrectFileDetailsToHtml}</div>`,
        permanent: true,
      }),
    );
  };

  const getValidatedFiles = (
    uploadedFiles: File[],
  ): { correctFiles: FileType[]; incorrectFileDetailList: IncorrectFileDetailsType[] } => {
    const correctFiles: FileType[] = [];
    const incorrectFileDetailList: IncorrectFileDetailsType[] = [];
    uploadedFiles.forEach(file => {
      if (file.type !== 'text/csv') {
        incorrectFileDetailList.push({
          file,
          reason: `Incorrect file type (${file.type ? file.type : 'unknown or folder'})`,
        });
      } else if (
        // find if file already exists by comparing file properties
        fileElements.some(
          ({ file: f }) => f.name === file.name && f.size === file.size && f.type === file.type,
        )
      ) {
        incorrectFileDetailList.push({ file, reason: `File already added` });
      } else {
        correctFiles.push({
          file,
          fileName: file.name,
          status: FileStatusEnum.LOADED,
          uuid: uuidv4(),
          size: file.size,
        });
      }
    });

    return { correctFiles, incorrectFileDetailList };
  };

  const onFilesAdd = (uploadedFiles: File[]): void => {
    const { correctFiles, incorrectFileDetailList } = getValidatedFiles(uploadedFiles);
    setFileElements(prevFiles => {
      // we should check if user already uploaded files. if yes, we should not include previous state
      if (shouldClear) {
        return [...correctFiles];
      }
      return [...prevFiles, ...correctFiles];
    });
    if (incorrectFileDetailList.length) {
      // check if does exists in redux fileDetailsManagement (for fileDetails on FileStatusEnum.LOADED status)
      // compare file by name and size
      // if exists - that file was already uploaded and was in state only for display details (ie. progress bar)
      // if does not exists - file has been already added

      // fetch from redux
      const reduxFileDetailList: FileDetailsType[] = useSelector(
        (state: RootState) => state.fileDetailsManagement,
      );
      // filter list from redux by status (if its uploaded - its added "to upload"
      const filteredByStateReduxDetailList = reduxFileDetailList.filter(
        file => file.status !== FileStatusEnum.LOADED,
      );

      // compare by name and filesize
      const verifiedIncorrectFileList = incorrectFileDetailList.filter(
        incorrectFile =>
          !filteredByStateReduxDetailList.some(
            reduxFile =>
              reduxFile.fileName === incorrectFile.file.name &&
              reduxFile.size === incorrectFile.file.size,
          ),
      );

      // if list exists - that means user duplicated files
      verifiedIncorrectFileList.length && setIncorrectFileNotification(verifiedIncorrectFileList);
    }
  };

  const onFilesSend = async (): Promise<void> => {
    const uploadPromises = fileElements.map(async fileElement => {
      try {
        const response = await upload_csv(fileElement);
        dispatch(updateFileDetail({ uuid: fileElement.uuid, status: FileStatusEnum.UPLOADED }));
        return response;
      } catch (e) {
        dispatch(updateFileDetail({ uuid: fileElement.uuid, status: FileStatusEnum.UPLOAD_ERROR }));
      }
    });
    // setUploadState(UploadStateEnum.IN_ADDING);
    await Promise.all(uploadPromises);
  };

  return (
    <UploadFileWrapper>
      <UploadFileSection>
        <UploadFileDragAndDrop onDrop={onFilesAdd} />
        <UploadFileButton onAdd={onFilesAdd} />
      </UploadFileSection>
      {fileElements.map(fileElement => fileElement.streaming_value)}
      {!!fileElements.length && (
        <UploadedFileList
          files={fileElements}
          onFileRemove={onFileRemove}
          onSend={(): void => {
            setUploadState(UploadStateEnum.SENDING);
          }}
          uploadState={uploadState}
        />
      )}
    </UploadFileWrapper>
  );
};
