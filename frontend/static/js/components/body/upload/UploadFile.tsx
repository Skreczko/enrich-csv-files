import React, { useState } from 'react';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';
import { UploadFileWrapper } from './UploadFile.styled';
import { useDispatch } from 'react-redux';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup.enums';

export const UploadFile: React.FC = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<File[]>([]);

  const handleRemove = (fileName: string): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const getValidatedFiles = (uploadedFiles: File[]): File[] => {
    const correctFiles: File[] = [];
    const incorrectFileDetailList: {
      reason: string;
      file: File;
    }[] = [];
    uploadedFiles.forEach(file => {
      if (file.type !== 'text/csv') {
        incorrectFileDetailList.push({ file, reason: `Incorrect file type (${file.type})` });
      } else if (files.some(f => f.name === file.name)) {
        incorrectFileDetailList.push({ file, reason: `File already added` });
      } else {
        correctFiles.push(file);
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

  const onFileAdd = (uploadedFiles: File[]): void => {
    const validatedFiles = getValidatedFiles(uploadedFiles);
    setFiles(prevFiles => [...prevFiles, ...validatedFiles]);
  };

  return (
    <UploadFileWrapper>
      <UploadFileDragAndDrop onDrop={onFileAdd} />
      <UploadFileButton onAdd={onFileAdd} />
      <div>
        {files.map(file => (
          <div key={file.name}>
            {file.name}
            <button onClick={(): void => handleRemove(file.name)}>Remove</button>
          </div>
        ))}
      </div>
    </UploadFileWrapper>
  );
};
