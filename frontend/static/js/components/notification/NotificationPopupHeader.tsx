import React from 'react';
import { Message } from 'semantic-ui-react';
import {
  MessageHeaderWrapper,
  NotificationCloseButton,
  NotificationContentWrapper,
} from './NotificationPopup.styled';
import { NotificationAppearance, NotificationAppearanceEnum } from './NotificationPopup';

type Props = {
  appearance: NotificationAppearanceEnum;
  content: string;
  removeNotification: () => void;
};

export const NotificationPopupHeader: React.FC<Props> = ({
  appearance,
  content,
  removeNotification,
}) => (
  <Message.Header data-testid={'notification-header'}>
    <MessageHeaderWrapper>
      <NotificationContentWrapper>
        <img
          data-testid={'notification-img'}
          src={NotificationAppearance[appearance].imgSrc}
          alt={appearance}
        />
        <p data-testid={'notification-content'}>{content}</p>
      </NotificationContentWrapper>
      <NotificationCloseButton data-testid={'close-button'} onClick={removeNotification}>
        <p>Close</p>
      </NotificationCloseButton>
    </MessageHeaderWrapper>
  </Message.Header>
);
