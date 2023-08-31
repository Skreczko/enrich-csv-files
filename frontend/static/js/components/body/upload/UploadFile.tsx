import React, { useState } from 'react';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';
import { UploadFileSection, UploadFileWrapper } from './UploadFile.styled';
import { useDispatch } from 'react-redux';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup.enums';
import { UploadedFileList } from './UploadedFileList';
import { upload_csv } from '../../../api/action';

enum FileStatusEnum {
  IN_UPLOAD_PROGRESS = 'in_upload_progress',
  LOADED = 'loaded',
  UPLOADED = 'uploaded',
  UPLOAD_ERROR = 'upload_error',
}

export type FileType = {
  file: File;
  status: FileStatusEnum;
  temp_id?: string; // used to recognize file during FileStatusEnum.IN_UPLOAD_PROGRESS to update streaming_value
  streaming_value?: number; // max 100
};

export type StreamingDetails = Partial<Omit<FileType, 'file'>>;

export const UploadFile: React.FC = () => {
  const dispatch = useDispatch();
  const [fileElements, setFileElements] = useState<FileType[]>([]);

  const onFileRemove = (fileName: string): void => {
    // setFileElements(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const getValidatedFiles = (uploadedFiles: File[]): FileType[] => {
    const correctFiles: FileType[] = [];
    const incorrectFileDetailList: {
      reason: string;
      file: File;
    }[] = [];
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
        correctFiles.push({ file, status: FileStatusEnum.LOADED });
      }
    });

    if (incorrectFileDetailList.length) {
      const incorrectFileDetailsToHtml = incorrectFileDetailList
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
    }

    return correctFiles;
  };

  const onFilesAdd = (uploadedFiles: File[]): void => {
    const validatedFiles = getValidatedFiles(uploadedFiles);
    setFileElements(prevFiles => [...prevFiles, ...validatedFiles]);
  };

  const setStreamingValue = ({ streaming_value, temp_id, status }: StreamingDetails): void => {
    console.log(
      'setStreamingValue',
      `streaming_value:${streaming_value} temp_id:${temp_id} status:${status}`,
    );
    setFileElements(prevState => {
      return [
        ...prevState.map(fileElement => {
          if (fileElement.temp_id === temp_id) {
            console.log(111111111111111111111);
            return {
              ...fileElement,
              // used during uploading process - status will not change
              streaming_value: streaming_value && fileElement.streaming_value,
              // used when upload is finished - streaming_value will not change (100)
              status: status && fileElement.status,
            };
          }
          return fileElement;
        }),
      ];
    });
  };

  const onFilesSend = async (): Promise<void> => {
    // set up temp_id for all files
    // set up temp_id for all files
    setFileElements(prevState => {
      const updatedFiles = prevState.map(fileElement => ({
        ...fileElement,
        status: FileStatusEnum.IN_UPLOAD_PROGRESS,
        streaming_value: 0,
        temp_id: Math.random().toString(36).substr(2, 9),
      }));

      // here we start the upload for each file
      updatedFiles.forEach(async fileElement => {
        try {
          const response = await upload_csv({
            fileElement,
            onStreamingValueChange: setStreamingValue,
          });
          console.log(fileElement.file.name, 'ok', response.data);
          setStreamingValue({ temp_id: fileElement.temp_id, status: FileStatusEnum.UPLOADED });
        } catch (e) {
          setStreamingValue({ temp_id: fileElement.temp_id, status: FileStatusEnum.UPLOAD_ERROR });
          console.error(fileElement.file.name, 'error', e);
        }
      });

      return updatedFiles; // this is the new state
    });
    console.log(111111111111111111, fileElements);
    const uploadPromises = fileElements.map(async fileElement => {
      try {
        const response = await upload_csv({
          fileElement,
          onStreamingValueChange: setStreamingValue,
        });
        console.log(fileElement.file.name, 'ok', response.data);
        setStreamingValue({ temp_id: fileElement.temp_id, status: FileStatusEnum.UPLOADED });
        return response;
      } catch (e) {
        setStreamingValue({ temp_id: fileElement.temp_id, status: FileStatusEnum.UPLOAD_ERROR });

        console.error(fileElement.file.name, 'error', e);
      }
    });
    await Promise.all(uploadPromises);
  };

  return (
    <UploadFileWrapper>
      <UploadFileSection>
        <UploadFileDragAndDrop onDrop={onFilesAdd} />
        <UploadFileButton onAdd={onFilesAdd} />
      </UploadFileSection>
      {!!fileElements.length && (
        <UploadedFileList files={fileElements} onFileRemove={onFileRemove} onSend={onFilesSend} />
      )}
    </UploadFileWrapper>
  );
};
