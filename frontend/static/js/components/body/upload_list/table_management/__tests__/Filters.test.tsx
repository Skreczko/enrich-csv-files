import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList } from '../../../../../utils/mockData';
import { Filters } from '../Filters';
import { FileListParamState } from '../../../../../redux/FileListParamSlice';
import { SortList } from '../../../../../api/enums';
import { FileTypeFilter, StatusFilter } from '../../../../../api/types';
import { advanceTo } from 'jest-date-mock';

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
beforeEach(() => {
  advanceTo(new Date(Date.UTC(2023, 9, 29, 12, 0, 0)));
});
afterAll(() => server.close());

describe('Filters', () => {
  test('Default render', () => {
    render(<Filters />);
    expect(screen.getByTestId('filters')).toBeInTheDocument();
    expect(screen.getByText('Filter by: File type')).toBeInTheDocument();
  });
  test.each([
    ['file type', FileTypeFilter.ENRICHED, null, 'Filter by: File type', 2],
    ['status', null, StatusFilter.IN_PROGRESS, 'Filter by: Status', 3],
  ])(
    'Render filters > %s filter',
    async (
      _,
      fileTypeFilter: FileTypeFilter | null,
      statusFilter: StatusFilter | null,
      buttonText: string,
      optionCount: number,
    ) => {
      const { store } = render(<Filters />);

      // find file type button
      const filterButton = screen.getByText(buttonText);
      expect(filterButton).toBeInTheDocument();

      // check if parent is not opened
      expect(filterButton.parentElement).toHaveAttribute('aria-expanded', 'false');

      // click on that button
      fireEvent.click(filterButton);

      // check if parent is opened
      expect(filterButton.parentElement).toHaveAttribute('aria-expanded', 'true');

      const options = within(filterButton.parentElement).queryAllByRole('option');
      expect(options).toHaveLength(optionCount);

      // click on "enriched" option
      fireEvent.click(options[1]);

      // check if that information will be stored to redux store
      await waitFor(() => {
        expect(store.getState().fileListParam).toEqual({
          ...defaultFileListParamState,
          filters: {
            ...defaultFileListParamState.filters,
            file_type: fileTypeFilter,
            status: statusFilter,
          },
        });
      });
    },
  );
  test.each([
    ['date from', true, 'Filter by: Created from'],
    ['date to', false, 'Filter by: Created to'],
  ])(
    'Render date filters > %s filter',
    async (_, isDateFrom: boolean, inputPlaceholder: string) => {
      const { store } = render(<Filters />);

      // find file type button
      const filterButton = screen.getByPlaceholderText(inputPlaceholder);
      expect(filterButton).toBeInTheDocument();

      // check if parent is not opened
      expect(filterButton.classList.contains('react-datepicker-ignore-onclickoutside')).toBe(false);

      fireEvent.click(filterButton);

      // check if parent is opened
      expect(filterButton.classList.contains('react-datepicker-ignore-onclickoutside')).toBe(true);

      // get all calendar options for day 29th Octorber 2023 - as its mocked
      const options = within(filterButton.parentElement.parentElement.parentElement).queryAllByRole(
        'option',
      );
      expect(options).toHaveLength(35);

      // click on "enriched" option
      fireEvent.click(options[0]);

      // check if that information will be stored to redux store
      await waitFor(() => {
        if (isDateFrom) {
          expect(store.getState().fileListParam.filters.date_from).not.toEqual(null);
        } else {
          expect(store.getState().fileListParam.filters.date_to).not.toEqual(null);
        }
      });
    },
  );
});
