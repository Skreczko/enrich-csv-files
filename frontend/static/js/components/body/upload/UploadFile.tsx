import React, { useState } from 'react';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';

export const UploadFile: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onFileAdd = (files: File[]): void => {
    const filteredFiles = files.filter(
      file => file.type === 'text/csv' && !files.some(f => f.name === file.name),
    );
    setFilesValidation(filteredFiles, files.length);
  };

  const handleRemove = (fileName: string): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const setFilesValidation = (newFiles: File[], originalLength: number): void => {
    if (newFiles.length !== originalLength) {
      setError('Some files were either duplicates or not CSVs.');
    } else {
      setError(null);
    }
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  return (
    <div>
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
    </div>
  );
};
