import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  NotificationPopupData,
  setNotificationPopupClose,
  setNotificationPopupTimeoutId,
} from '../../redux/NotificationPopupSlice';
import { RootState } from '../../redux/store';
import { NotificationWrapper } from './NotificationPopup.styled';
import { Message } from 'semantic-ui-react';
import { HTML } from '../utils/HTML';
import ErrorImage from '../../../img/notification/error.png';
import SuccessImage from '../../../img/notification/success.png';
import WarningImage from '../../../img/notification/warning.png';
import InfoImage from '../../../img/notification/info.png';
import { NotificationPopupHeader } from './NotificationPopupHeader';

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
export const NotificationPopup: React.FC = () => {
  const dispatch = useDispatch();
  const data: NotificationPopupData[] = useSelector((state: RootState) => state.notificationPopup);

  const removeNotification = (id: string): void => {
    dispatch(setNotificationPopupClose({ closeId: id }));
  };

  useEffect(() => {
    if (data.length) {
      const timeoutArray: {
        timeoutId: any; // when clearing the timeout the type needs to be Timeout but when setting the timeout it returns type number.
        componentId: string;
      }[] = [];
      data.forEach(({ id, timeoutId, permanent }) => {
        if (!permanent && !timeoutId) {
          timeoutArray.push({
            timeoutId: setTimeout(() => {
              removeNotification(id);
            }, 10000),
            componentId: id,
          });
        }
      });
      dispatch(setNotificationPopupTimeoutId({ timeoutArray }));
    }
  }, [data]);

  return (
    <NotificationWrapper open={!!data.length}>
      {data?.map(({ appearance, content, additionalContent, id }) => (
        <Message
          {...{ [appearance]: true }}
          key={id}
          size='tiny'
          style={{ width: '100%', height: '100%' }}
        >
          <NotificationPopupHeader
            appearance={appearance}
            content={content}
            removeNotification={(): void => removeNotification(id)}
          />
          <Message.Content>
            {additionalContent && (
              <HTML text={additionalContent} style={{ fontSize: '90%', marginTop: '5px' }} />
            )}
          </Message.Content>
        </Message>
      ))}
    </NotificationWrapper>
  );
};
