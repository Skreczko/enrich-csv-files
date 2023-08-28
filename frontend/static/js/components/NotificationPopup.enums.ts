import ErrorImage from '../../img/notification/error.png';
import InfoImage from '../../img/notification/info.png';
import SuccessImage from '../../img/notification/success.png';
import WarningImage from '../../img/notification/warning.png';

export enum NotificationAppearanceEnum {
  // https://react.semantic-ui.com/collections/message/
  ERROR = 'negative',
  SUCCESS = 'positive',
  WARNING = 'warning',
  INFO = 'info',
}

type NotificationAppearanceType = {
  imgSrc: string;
};

export const NotificationAppearance: Record<
  NotificationAppearanceEnum,
  NotificationAppearanceType
> = {
  [NotificationAppearanceEnum.ERROR]: {
    imgSrc: ErrorImage,
  },
  [NotificationAppearanceEnum.SUCCESS]: {
    imgSrc: SuccessImage,
  },
  [NotificationAppearanceEnum.WARNING]: {
    imgSrc: WarningImage,
  },
  [NotificationAppearanceEnum.INFO]: {
    imgSrc: InfoImage,
  },
};
