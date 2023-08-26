import React, { useState, useRef } from 'react';

export const UploadFile: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFiles: File[] = Array.from(e.dataTransfer.files).filter(file =>
      file.type === 'text/csv' && !files.some(f => f.name === file.name)
    );

    setFilesValidation(droppedFiles, e.dataTransfer.files.length);
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles: File[] = Array.from(e.target.files!).filter(file =>
      file.type === 'text/csv' && !files.some(f => f.name === file.name)
    );

    setFilesValidation(selectedFiles, e.target.files!.length);
    if (inputRef.current) {
      inputRef.current.value = '';  // Reset the input value
    }
  };

  const handleRemove = (fileName: string): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const setFilesValidation = (newFiles: File[], originalLength: number) => {
    if (newFiles.length !== originalLength) {
      setError('Some files were either duplicates or not CSVs.');
    } else {
      setError(null);
    }
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleClick = (): void => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div>
      <div
        ref={dropRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ width: '300px', height: '100px', border: '2px dashed', textAlign: 'center', lineHeight: '100px', position: 'relative' }}
      >
        {isDragging ?
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(200,200,200,0.7)', zIndex: 2, textAlign: 'center', lineHeight: '100px' }}>
            Drop here
          </div>
          :
          "Drag & drop CSV files"
        }
      </div>
      <button onClick={handleClick} style={{ marginTop: '10px' }}>Add CSV file</button>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <div>
        {files.map(file => (
          <div key={file.name}>
            {file.name}
            <button onClick={() => handleRemove(file.name)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};
