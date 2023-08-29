import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  NotificationPopupData,
  setNotificationPopupClose,
  setNotificationPopupTimeoutId,
} from '../../redux/NotificationPopupSlice';
import { RootState } from '../../redux/store';
import {
  MessageHeaderWrapper,
  NotificationCloseButton,
  NotificationContentWrapper,
  NotificationWrapper,
} from './NotificationPopup.styled';
import { Message } from 'semantic-ui-react';
import { NotificationAppearance } from './NotificationPopup.enums';
import { HTML } from '../utils/HTML';

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
          <Message.Header>
            <MessageHeaderWrapper>
              <NotificationContentWrapper>
                <img src={NotificationAppearance[appearance].imgSrc} alt={appearance} />
                <p>{content}</p>
              </NotificationContentWrapper>
              <NotificationCloseButton onClick={(): void => removeNotification(id)}>
                <p>Close</p>
              </NotificationCloseButton>
            </MessageHeaderWrapper>
          </Message.Header>
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
