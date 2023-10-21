import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { PageSizeDropdown } from '../PageSizeDropdown';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(basicUploadList));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const OPTION_COUNT = 3;
const SELECTED_PAGE_SIZE = 10;

describe('PageSizeDropdown', () => {
  test('Rendering and functionality', async () => {
    const { store } = render(<PageSizeDropdown />);

    // Verify initial rendering and button state
    const dropdownWrapper = screen.getByTestId('page-size-dropdown');
    expect(dropdownWrapper).toBeInTheDocument();
    const dropdownButton = within(dropdownWrapper).getByRole('listbox');
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
    expect(store.getState().fileListParam.page_size).not.toEqual(SELECTED_PAGE_SIZE);

    // Simulate dropdown click to open the options
    fireEvent.click(dropdownButton);
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');
    const options = within(dropdownButton).getAllByRole('option');
    expect(options).toHaveLength(OPTION_COUNT);

    // Select the "10" option and verify the state
    fireEvent.click(options[0]);
    await waitFor(() => {
      expect(store.getState().fileListParam.page_size).toEqual(SELECTED_PAGE_SIZE);
    });
  });
});
