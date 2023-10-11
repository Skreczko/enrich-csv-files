// eslint-disable-next-line no-undef
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  // eslint-disable-next-line no-undef
  process.on('unhandledRejection', reason => {
    throw reason;
  });
  // Avoid memory leak by adding too many listeners
  // eslint-disable-next-line no-undef
  process.env.LISTENING_TO_UNHANDLED_REJECTION = '1';
}

import { configure } from '@testing-library/dom';

// tests are slow in ci
const TIMEOUT_IN_MS = 25000;
jest.setTimeout(TIMEOUT_IN_MS);
configure({
  asyncUtilTimeout: TIMEOUT_IN_MS,
});
