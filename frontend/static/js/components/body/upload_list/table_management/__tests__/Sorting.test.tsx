import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { Sorting } from '../Sorting';
import { SortList } from '../../../../../api/enums';
import { fileListParamInitialState } from '../../../../../redux/FileListParamSlice';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(basicUploadList));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Filters', () => {
  test('Default render', async () => {
    const { store } = render(<Sorting />);

    expect(screen.getByTestId('sorting')).toBeInTheDocument();
    // find sorting button
    const sortButton = screen.getByText('Sorted by: Created (DESC)');
    expect(sortButton).toBeInTheDocument();

    // check if parent is not opened
    expect(sortButton.parentElement).toHaveAttribute('aria-expanded', 'false');

    // check if headers are rendered
    const headers = sortButton.parentElement.querySelectorAll('.header');
    expect(headers).toHaveLength(5);

    // click on that button
    fireEvent.click(sortButton);

    // check if parent is opened
    expect(sortButton.parentElement).toHaveAttribute('aria-expanded', 'true');

    const options = within(sortButton.parentElement).queryAllByRole('option');
    expect(options).toHaveLength(10);

    // click on Status (ASC) option
    fireEvent.click(options[4]);

    // check if that information will be stored to redux store
    await waitFor(() => {
      expect(store.getState().fileListParam).toEqual({
        ...fileListParamInitialState,
        sort: SortList.STATUS_ASC,
      });
    });
  });
});
