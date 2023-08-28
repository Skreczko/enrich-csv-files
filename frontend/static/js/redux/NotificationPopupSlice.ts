import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationAppearance } from '../components/utils/enums';

const NOTIFICATION_MAX_MESSAGES = 5;

export const getId = (): string => Math.random().toString(36).substr(2, 9);

export interface NotificationPopupData {
  content: string;
  appearance: NotificationAppearance;
  id?: string;
  timeoutId?: NodeJS.Timeout;
}

type InitialState = NotificationPopupData;

const validateDuplicatedMessages = (content: string, state: InitialState[]): void => {
  // omit if message content is same
  const index = state.findIndex(data => data.content === content);
  if (index != -1) {
    if (state[index].timeoutId) {
      clearTimeout(state[index].timeoutId);
    }
    state.splice(index, 1);
  }
};

const validateOldestNotification = (state: InitialState[]): void => {
  if (state.length >= NOTIFICATION_MAX_MESSAGES) {
    if (state[0].timeoutId) {
      clearTimeout(state[0].timeoutId);
    }
    state.splice(0, 1);
  }
};

const notificationPopupSlice = createSlice({
  name: 'notificationPopup',
  initialState: [] as InitialState[],
  reducers: {
    setNotificationPopupOpen: (
      state,
      { payload: { content, appearance } }: PayloadAction<NotificationPopupData>,
    ) => {
      validateDuplicatedMessages(content, state);
      validateOldestNotification(state);

      state.push({
        content,
        appearance,
        id: getId(),
        timeoutId: undefined,
      });
    },
    setNotificationPopupTimeoutId: (state, { payload: { timeoutArray } }) => {
      timeoutArray.forEach(
        ({ componentId, timeoutId }: { timeoutId: NodeJS.Timeout; componentId: string }) => {
          const index = state.findIndex(data => data.id === componentId);
          // for same component id in state - add the timeout id
          if (index != -1 && !state[index].timeoutId) {
            state[index] = { ...state[index], timeoutId };
          }
        },
      );
    },
    setNotificationPopupClose: (state, { payload: { closeId } }) => {
      const index = state.findIndex(({ id }) => id === closeId);
      if (index != -1) {
        // if the user closes a message before the timeout is triggered - remove the timeout
        clearTimeout(state[index].timeoutId);
      }
      state.splice(index, 1);
    },
  },
});

export const {
  setNotificationPopupOpen,
  setNotificationPopupClose,
  setNotificationPopupTimeoutId,
} = notificationPopupSlice.actions;

export default notificationPopupSlice.reducer;
