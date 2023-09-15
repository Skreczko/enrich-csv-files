import { UploadElementState } from '../../../redux/UploadSectionSlice';

export type FileType = UploadElementState & { file: File };

export type IncorrectFileDetailsType = {
  reason: string;
  file: File;
};

export enum UploadStateEnum {
  IN_ADDING = 'in_adding',
  SENDING = 'sending',
}

export enum FileStatusEnum {
  LOADED = 'loaded',
  UPLOADED = 'uploaded',
  UPLOAD_ERROR = 'upload_error',
}
