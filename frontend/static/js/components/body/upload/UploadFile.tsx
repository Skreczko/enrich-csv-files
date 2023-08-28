import React, { useState } from 'react';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';
import { UploadFileWrapper } from './UploadFile.styled';
import { useDispatch } from 'react-redux';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../NotificationPopup.enums';

export const UploadFile: React.FC = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onFileAdd = (uploadedFiles: File[]): void => {
    const filteredFiles = uploadedFiles.filter(
      file => file.type === 'text/csv' && !files.some(f => f.name === file.name),
    );
    console.log('files', uploadedFiles);
    console.log('filteredFiles', filteredFiles);
    setFilesValidation(filteredFiles, uploadedFiles.length);
  };

  const handleRemove = (fileName: string): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const setFilesValidation = (newFiles: File[], originalLength: number): void => {
    if (newFiles.length !== originalLength) {
      // setError('Some files were either duplicates or not CSVs.');
      dispatch(
        setNotificationPopupOpen({
          appearance: NotificationAppearanceEnum.ERROR,
          content: 'Some files were either duplicates or not CSVs.',
        }),
      );
    }
    // else {
    //   setError(null);
    // }
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  return (
    <UploadFileWrapper>
      <UploadFileDragAndDrop onDrop={onFileAdd} />
      <UploadFileButton onAdd={onFileAdd} />
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
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
