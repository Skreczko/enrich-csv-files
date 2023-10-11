import 'whatwg-fetch';
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const errorsOrWarnings: ['warn' | 'error', any][] = [];
const { error, warn } = console;

// eslint-disable-next-line no-undef
global.console.error = (...args: any[]): void => {
  errorsOrWarnings.push(['error', Array.from(args)]);
  error(...args);
};
// eslint-disable-next-line no-undef
global.console.warn = (...args: any[]): void => {
  const argsArray = Array.from(args);

  // As these redux checks should already be disabled but seems to throw warnings
  // from time to time we can ignore them while testing. (it throws warnings about how long it took to update the state/change the state)
  if (
    argsArray[0].includes('ImmutableStateInvariantMiddleware') ||
    argsArray[0].includes('SerializableStateInvariantMiddleware')
  ) {
    return;
  }
  // These are errors in external libraries (react-select and jsonschema) that we can't
  // control, so ignore them.
  if (
    /^Warning: componentWillReceiveProps has been renamed/.test(argsArray[0]) &&
    (argsArray[1] === 'Form' || argsArray[1] === 'Async, Select')
  ) {
    return;
  }
  errorsOrWarnings.push(['warn', argsArray]);
  warn(...args);
};

afterEach((): void => {
  if (errorsOrWarnings.length > 0) {
    const count = { error: 0, warn: 0 };
    errorsOrWarnings.map(([type, args]) => {
      count[type] += 1;
      console[type](...args);
    });
    const copyOfErrorsOrWarnings = errorsOrWarnings.slice();
    errorsOrWarnings.length = 0;
    const messages = [];
    if (count.error) {
      messages.push(`${count.error} error(s)`);
    }
    if (count.warn) {
      messages.push(`${count.warn} warning(s)`);
    }
    throw new Error(`\n- Console had ${messages.join(' and ')}:\n\n${copyOfErrorsOrWarnings}`);
  }
});
