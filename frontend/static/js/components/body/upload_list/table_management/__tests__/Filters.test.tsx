import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { Filters } from '../Filters';
import { FileListParamState } from '../../../../../redux/FileListParamSlice';
import { SortList } from '../../../../../api/enums';
import { FileTypeFilter } from '../../../../../api/types';

const defaultFileListParamState: FileListParamState = {
  search: '',
  page: 1,
  sort: SortList.CREATED_DESC,
  page_size: 20,
  filters: {
    status: null,
    file_type: null,
    date_from: null,
    date_to: null,
  },
};

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(basicUploadList));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Filters', () => {
  test('Default render', () => {
    render(<Filters />);
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByText('Filter by: File type')).toBeInTheDocument();
  });
  test('File type render', async () => {
    const { store } = render(<Filters />);

    // find file type button
    const filterButton = screen.getByText('Filter by: File type');
    expect(filterButton).toBeInTheDocument();

    // check if parent is not opened
    expect(filterButton.parentElement).toHaveAttribute('aria-expanded', 'false');

    // click on that button
    fireEvent.click(filterButton);

    // check if parent is opened
    expect(filterButton.parentElement).toHaveAttribute('aria-expanded', 'true');

    const options = within(filterButton.parentElement).queryAllByRole('option');
    expect(options).toHaveLength(2);

    // click on "enriched" option
    fireEvent.click(options[1]);

    // check if that information will be stored to redux store
    await waitFor(() => {
      expect(store.getState().fileListParam).toEqual({
        ...defaultFileListParamState,
        filters: { ...defaultFileListParamState.filters, file_type: FileTypeFilter.ENRICHED },
      });
    });
  });
});
