import { TableRowStatusEnum } from './enums';

type ProgressBarStatus = {
  type: TableRowStatusEnum.PROGRESS;
  popupText: string;
  progress: number; // max 100
  backgroundColor?: string;
};

type IconStatus = {
  type: TableRowStatusEnum.ICON;
  popupText: string;
  imgSrc: string;
};

export type TableRowStatusDetails = ProgressBarStatus | IconStatus;
