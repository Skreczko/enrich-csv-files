import React from 'react';
import { FileUploadControlsWrapper } from './FileUploadControls.styled';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';

type Props = {
  onFilesAdd: (file: File[]) => void;
};

export const FileUploadControls: React.FC<Props> = ({ onFilesAdd }) => (
  <FileUploadControlsWrapper>
    <UploadFileDragAndDrop onDrop={onFilesAdd} />
    <UploadFileButton onAdd={onFilesAdd} />
  </FileUploadControlsWrapper>
);
