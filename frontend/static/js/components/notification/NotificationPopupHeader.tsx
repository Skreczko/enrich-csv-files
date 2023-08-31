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
  <Message.Header>
    <MessageHeaderWrapper>
      <NotificationContentWrapper>
        <img src={NotificationAppearance[appearance].imgSrc} alt={appearance} />
        <p>{content}</p>
      </NotificationContentWrapper>
      <NotificationCloseButton onClick={removeNotification}>
        <p>Close</p>
      </NotificationCloseButton>
    </MessageHeaderWrapper>
  </Message.Header>
);
