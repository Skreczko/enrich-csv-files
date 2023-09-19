import React, { useState, useRef } from 'react';
import { DragAndDropWrapper, DragWrapper, DropWrapper } from './UploadFileDragAndDrop.styled';
import DragImage from '../../../../img/body/upload/drag.png';
import DropImage from '../../../../img/body/upload/drop.png';

type Props = {
  onDrop: (file: File[]) => void;
};

export const UploadFileDragAndDrop: React.FC<Props> = ({ onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    onDrop(Array.from(e.dataTransfer.files));
    setIsDragging(false);
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

  return (
    <DragAndDropWrapper
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging ? (
        <DropWrapper>
          <img src={DropImage} alt={'drop'} />
          <p>Drop here</p>
        </DropWrapper>
      ) : (
        <DragWrapper>
          <img src={DragImage} alt={'drag'} />
          <p>Drag and drop CSV files</p>
        </DragWrapper>
      )}
    </DragAndDropWrapper>
  );
};
