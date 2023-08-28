import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
  NotificationPopupData,
  setNotificationPopupClose,
  setNotificationPopupTimeoutId,
} from '../redux/NotificationPopupSlice';
import { RootState } from '../redux/store';
import { MessageHeaderWrapper, NotificationWrapper } from './NotificationPopup.styled';
import { Message } from 'semantic-ui-react';

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
      data.forEach(({ id, timeoutId }) => {
        if (!timeoutId) {
          timeoutArray.push({
            timeoutId: setTimeout(() => {
              removeNotification(id);
            }, 10000),
            // }, 999999),
            componentId: id,
          });
        }
      });
      dispatch(setNotificationPopupTimeoutId({ timeoutArray }));
    }
  }, [data]);

  return (
    <NotificationWrapper open={!!data.length}>
      {data?.map(({ appearance, content, id }) => (
        <Message
          {...{ [appearance]: true }}
          key={id}
          size='tiny'
          style={{ width: '100%', height: '100%' }}
        >
          <Message.Header>
            <MessageHeaderWrapper>
              <p>{content}</p>
              <div onClick={(): void => removeNotification(id)}>Close</div>
            </MessageHeaderWrapper>
          </Message.Header>
        </Message>
      ))}
    </NotificationWrapper>
  );
};
