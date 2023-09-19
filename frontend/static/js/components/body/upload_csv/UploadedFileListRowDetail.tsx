import { UploadElementState } from '../../../redux/UploadSectionSlice';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import DeleteImage from '../../../../img/body/upload/delete.png';
import PendingImage from '../../../../img/body/upload/pending.png';
import SuccessImage from '../../../../img/notification/success.png';
import ErrorImage from '../../../../img/notification/error.png';
import {
  FileName,
  ProgressBar,
  ProgressBarFiller,
  UploadStatusImageWrapper,
} from './UploadedFileListRowDetail.styled';
import { FileStatusEnum, FileType } from './types';

type Props = {
  fileElement: FileType;
  isSending: boolean;
  onFileRemove: (uuid: string) => void;
};

const selectFileDetailByUUID = (state: RootState, uuid: string): UploadElementState =>
  state.uploadSection.find((detail: UploadElementState) => detail.uuid === uuid);

export const UploadedFileListRowDetail: React.FC<Props> = ({
  fileElement,
  isSending,
  onFileRemove,
}) => {
  const fileDetail = useSelector(state => selectFileDetailByUUID(state, fileElement.uuid));

  const getImageByStatus = useCallback(
    (status: FileStatusEnum): string => {
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
    },
    [isSending],
  );

  const isLoaded = fileDetail?.status == FileStatusEnum.LOADED;
  const { name, size } = fileElement.file;
  const uploadingPercent = fileDetail?.streaming_value || 0;

  return (
    <>
      <ProgressBar>
        <ProgressBarFiller width={uploadingPercent} />
        <FileName color={uploadingPercent > 0 ? 'white' : 'black'}>{name}</FileName>
      </ProgressBar>
      <div>({(size / 1024 ** 2).toFixed(2)} MB)</div>
      <UploadStatusImageWrapper
        onClick={(): void => {
          isLoaded && onFileRemove(fileElement.uuid);
        }}
      >
        <img src={getImageByStatus(fileDetail?.status)} alt={fileDetail?.status} />
        <p>{!!uploadingPercent && `(${uploadingPercent}%)`}</p>
      </UploadStatusImageWrapper>
    </>
  );
};
