import React from 'react';
import { CustomButton } from '../../utils/CustomButton.styled';
import {
  FileListWrapper,
  FileName,
  ProgressBar,
  ProgressBarFiller,
  UploadedFileListWrapper,
  UploadStatusImageWrapper,
} from './UploadedFileList.styled';
import DeleteImage from '../../../../img/body/upload/delete.png';
import PendingImage from '../../../../img/body/upload/pending.png';
import SuccessImage from '../../../../img/notification/success.png';
import ErrorImage from '../../../../img/notification/error.png';
import { FileType, UploadStateEnum } from './UploadFile';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { FileDetailsType, FileStatusEnum } from '../../../redux/FileDetailsManagementSlice';

interface Props {
  files: FileType[];
  onFileRemove: (name: string) => void;
  onSend: () => void;
  uploadState: UploadStateEnum;
}

export const UploadedFileList: React.FC<Props> = ({ files, onFileRemove, onSend, uploadState }) => {
  const fileDetails: FileDetailsType[] = useSelector(
    (state: RootState) => state.fileDetailsManagement,
  );
  const isSending = uploadState == UploadStateEnum.SENDING;

  const getImageByStatus = (status: FileStatusEnum): string => {
    switch (status) {
      case FileStatusEnum.LOADED:
        if (!isSending) return DeleteImage;
        return PendingImage;
      case FileStatusEnum.UPLOADED:
        return SuccessImage;
      case FileStatusEnum.UPLOAD_ERROR:
        return ErrorImage;
      default: {
        return '';
      }
    }
  };
  return (
    <UploadedFileListWrapper>
      <FileListWrapper>
        {files.map(fileElement => {
          const fileDetail = fileDetails.find(detail => detail.uuid === fileElement.uuid);
          const isLoaded = fileDetail?.status == FileStatusEnum.LOADED;
          const { name, size } = fileElement.file;
          const uploadingPercent = fileDetail?.streaming_value;
          return (
            <>
              <ProgressBar key={fileElement.uuid}>
                <ProgressBarFiller width={Number(uploadingPercent)} />
                <FileName color={uploadingPercent > 0 ? 'white' : 'black'}>{name}</FileName>
              </ProgressBar>
              <div>({(size / 1024 ** 2).toFixed(2)} MB)</div>

              <UploadStatusImageWrapper
                onClick={(): void => {
                  isLoaded && onFileRemove(fileElement.uuid);
                }}
              >
                <img src={getImageByStatus(fileDetail?.status)} alt={fileDetail?.status} />
                <p>{uploadingPercent && `(${uploadingPercent}%)`}</p>
              </UploadStatusImageWrapper>
            </>
          );
        })}
      </FileListWrapper>
      <CustomButton onClick={onSend} disabled={isSending}>
        <p>upload</p>
      </CustomButton>
    </UploadedFileListWrapper>
  );
};
