import React from 'react';
import { CustomButton } from '../../utils/CustomButton.styled';
import {
  FileListWrapper,
  UploadButtonWrapper,
  UploadedFileListWrapper,
} from './UploadedFileList.styled';
import { UploadedFileListRowDetail } from './UploadedFileListRowDetail';
import { FileType, UploadStateEnum } from './types';

type Props = {
  files: FileType[];
  onFileRemove: (name: string) => void;
  onSend: () => void;
  uploadState: UploadStateEnum;
  shouldClear: boolean;
};

export const UploadedFileList: React.FC<Props> = ({
  files,
  onFileRemove,
  onSend,
  uploadState,
  shouldClear,
}) => {
  const isSending = uploadState == UploadStateEnum.SENDING;
  // user should not be able to send exactly same file stack one more time or during uploading process
  const isLocked = shouldClear || isSending;

  const handleClick = (): void => {
    if (!shouldClear && !isSending) {
      onSend();
    }
    return;
  };

  return (
    <UploadedFileListWrapper>
      <FileListWrapper>
        {files.map(fileElement => (
          <UploadedFileListRowDetail
            key={fileElement.uuid}
            fileElement={fileElement}
            isSending={isSending}
            onFileRemove={onFileRemove}
          />
        ))}
      </FileListWrapper>
      <UploadButtonWrapper>
        <CustomButton onClick={handleClick} disabled={isLocked}>
          <p>upload</p>
        </CustomButton>
      </UploadButtonWrapper>
    </UploadedFileListWrapper>
  );
};
