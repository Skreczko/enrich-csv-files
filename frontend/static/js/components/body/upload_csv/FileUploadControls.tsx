import React from 'react';
import { FileUploadControlsWrapper } from './FileUploadControls.styled';
import { UploadFileDragAndDrop } from './UploadFileDragAndDrop';
import { UploadFileButton } from './UploadFileButton';

type Props = {
  onFilesAdd: (file: File[]) => void;
};

export const FileUploadControls: React.FC<Props> = ({ onFilesAdd }) => (
  <FileUploadControlsWrapper data-testid={'file-upload-controls'}>
    <UploadFileDragAndDrop onDrop={onFilesAdd} />
    <UploadFileButton onAdd={onFilesAdd} />
  </FileUploadControlsWrapper>
);
