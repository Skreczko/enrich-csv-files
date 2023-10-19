import React from 'react';
import { fireEvent, render, screen } from '../../../utils/testing-utils';
import { csvElementDetailFetched } from '../../../utils/mockData';
import { RootState } from '../../../redux/store';
import { NotificationAppearanceEnum, NotificationPopup } from '../NotificationPopup';
import {
  NOTIFICATION_MAX_MESSAGES,
  NotificationPopupData,
  setNotificationPopupOpen,
} from '../../../redux/NotificationPopupSlice';
import { truncateString } from '../helpers';

describe('NotificationPopup', () => {
  const renderComponent = (appearance: NotificationAppearanceEnum): RootState => {
    const { store } = render(<NotificationPopup />, [
      setNotificationPopupOpen({
        appearance,
        content: `File ${truncateString(csvElementDetailFetched.original_file_name, 100)} (${
          csvElementDetailFetched.uuid
        }) appearance ${appearance}`,
        additionalContent: 'Additional content',
      }),
    ]);
    return store;
  };

  test.each([
    ['success', NotificationAppearanceEnum.SUCCESS],
    ['error', NotificationAppearanceEnum.ERROR],
    ['warning', NotificationAppearanceEnum.WARNING],
    ['info', NotificationAppearanceEnum.INFO],
  ])('Default render > notification appearance %s', (_, appearance: NotificationAppearanceEnum) => {
    renderComponent(appearance);

    // check if notification is correctly rendered
    expect(screen.getByTestId('notification-popup')).toHaveAttribute('open');

    // check notification color depending on appearance
    const notificationBar = screen.getByTestId('notification-bar');
    expect(notificationBar).toBeInTheDocument();
    expect(notificationBar).toHaveClass(appearance);

    expect(screen.getByTestId('notification-header')).toBeInTheDocument();

    // check notification icon
    const imgElement = screen.getByTestId('notification-img');
    expect(imgElement).toHaveAttribute('alt', appearance);

    // check additional content
    expect(screen.getByTestId('html-component').textContent).toBe('Additional content');

    // check content
    expect(screen.getByTestId('notification-content').textContent).toBe(
      `File users_posts_audience.csv_enriched.csv (3947b72a-d907-44aa-92c2-6ce44813e230) appearance ${appearance}`,
    );

    expect(screen.getByTestId('close-button')).toBeInTheDocument();
  });
  test('Close button', () => {
    const store = renderComponent(NotificationAppearanceEnum.SUCCESS);
    expect(store.getState().notificationPopup).toHaveLength(1);

    expect(screen.getByTestId('notification-popup')).toHaveAttribute('open');

    fireEvent.click(screen.getByTestId('close-button'));

    expect(store.getState().notificationPopup).toEqual([]);

    expect(screen.getByTestId('notification-popup')).not.toHaveAttribute('open');
  });
  test('Check maximum count of NOTIFICATION_MAX_MESSAGES', () => {
    const store = renderComponent(NotificationAppearanceEnum.SUCCESS);

    // check if 1 notification is in redux
    expect(store.getState().notificationPopup).toHaveLength(1);

    // add 10 additional notifications
    Array(10)
      .fill(NotificationAppearanceEnum.WARNING)
      .forEach(appearance => {
        store.dispatch(
          setNotificationPopupOpen({
            appearance,
            content: `File ${truncateString(csvElementDetailFetched.original_file_name, 100)} (${
              csvElementDetailFetched.uuid
            }) appearance ${appearance}`,
            additionalContent: 'Additional content',
          }),
        );
      });

    const notificationList: NotificationPopupData[] = store.getState().notificationPopup;
    expect(notificationList).toHaveLength(NOTIFICATION_MAX_MESSAGES);

    // check if there is limit on notification messages displayed for user
    expect(notificationList.map(notification => notification.appearance)).toEqual(
      Array(3).fill(NotificationAppearanceEnum.WARNING),
    );
  });
});
