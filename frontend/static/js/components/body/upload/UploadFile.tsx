import React, { useEffect, useState } from 'react';
import { UploadFileWrapper } from './UploadFile.styled';
import { useDispatch } from 'react-redux';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { UploadedFileList } from './UploadedFileList';
import { upload_csv } from '../../../api/action';
import { v4 as uuidv4 } from 'uuid';
import {
  FileDetailsType,
  FileStatusEnum,
  setFileDetails,
  updateFileDetail,
} from '../../../redux/FileDetailsManagementSlice';
import { FileUploadControls } from './FileUploadControls';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dispatch(setFileDetails(fileElements.map(({ file: _, ...fileDetails }) => fileDetails)));
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
      const isDuplicate = fileElements.some(
        ({ file: f }) => f.name === file.name && f.size === file.size && f.type === file.type,
      );

      if (file.type !== 'text/csv') {
        incorrectFileDetailList.push({
          file,
          reason: `Incorrect file type (${file.type ? file.type : 'unknown or folder'})`,
        });
      } else if (isDuplicate) {
        // User cannot duplicate files in same uploading process -
        // that means, if user upload file, same file can be added in next turn.
        // In future development, additional request to check if that file exists
        // in database may be required (comparing by file name, size and type). Not implemented.
        if (shouldClear) {
          correctFiles.push({
            file,
            fileName: file.name,
            status: FileStatusEnum.LOADED,
            uuid: uuidv4(),
          });
        } else {
          incorrectFileDetailList.push({ file, reason: 'File already added' });
        }
      } else {
        correctFiles.push({
          file,
          fileName: file.name,
          status: FileStatusEnum.LOADED,
          uuid: uuidv4(),
        });
      }
    });

    return { correctFiles, incorrectFileDetailList };
  };

  const onFilesAdd = (uploadedFiles: File[]): void => {
    const { correctFiles, incorrectFileDetailList } = getValidatedFiles(uploadedFiles);
    setFileElements(prevFiles => {
      if (shouldClear) {
        return [...correctFiles];
      }
      return [...prevFiles, ...correctFiles];
    });
    incorrectFileDetailList.length && setIncorrectFileNotification(incorrectFileDetailList);
  };

  const onFilesSend = async (): Promise<void> => {
    const uploadPromises = fileElements.map(async fileElement => {
      try {
        const response = await upload_csv(fileElement);
        dispatch(updateFileDetail({ uuid: fileElement.uuid, status: FileStatusEnum.UPLOADED }));
        // TODO assign task_id from celery from response to that redux state
        return response;
      } catch (e) {
        dispatch(updateFileDetail({ uuid: fileElement.uuid, status: FileStatusEnum.UPLOAD_ERROR }));
      }
    });
    await Promise.all(uploadPromises);
  };

  return (
    <UploadFileWrapper>
      <FileUploadControls onFilesAdd={onFilesAdd} />
      {!!fileElements.length && (
        <UploadedFileList
          files={fileElements}
          onFileRemove={onFileRemove}
          onSend={(): void => {
            setUploadState(UploadStateEnum.SENDING);
          }}
          uploadState={uploadState}
          shouldClear={shouldClear}
        />
      )}
    </UploadFileWrapper>
  );
};
