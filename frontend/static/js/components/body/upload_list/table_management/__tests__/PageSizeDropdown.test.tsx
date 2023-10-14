import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { advanceTo } from 'jest-date-mock';
import { PageSizeDropdown } from '../PageSizeDropdown';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(basicUploadList));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  advanceTo(new Date(Date.UTC(2023, 9, 29, 12, 0, 0)));
});
afterAll(() => server.close());

describe('PageSizeDropdown', () => {
  test('Rendering', async () => {
    const { store } = render(<PageSizeDropdown />);

    // find file type button
    const dropdownWrapper = screen.getByTestId('page-size-dropdown');
    expect(dropdownWrapper).toBeInTheDocument();

    const dropdownButton = within(dropdownWrapper).queryAllByRole('listbox')[0];

    // check if dropdown is not opened
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');

    // check if page_size is not 10 (we are going to select 10 below)
    expect(store.getState().fileListParam.page_size).not.toEqual(10);

    // click on that option
    fireEvent.click(dropdownButton);

    // check if dropdown is opened
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    const options = within(dropdownButton).queryAllByRole('option');
    expect(options).toHaveLength(3);

    // click on "10" option
    fireEvent.click(options[0]);

    // check if that information will be stored to redux store
    await waitFor(() => {
      expect(store.getState().fileListParam.page_size).toEqual(10);
    });
  });
});
