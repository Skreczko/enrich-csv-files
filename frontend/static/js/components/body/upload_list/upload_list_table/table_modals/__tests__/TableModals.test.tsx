import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '../../../../../../utils/testing-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { basicUploadList, csvElementDetailNotFetched } from '../../../../../../utils/mockData';
import { TableModals } from '../TableModals';
import { truncateString } from '../../../../../notification/helpers';

const server = setupServer(
  rest.get('/api/_internal/csv_list', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...basicUploadList,
        result: [csvElementDetailNotFetched, ...basicUploadList.result],
      }),
    );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('TableModals', () => {
  test('DeleteModal', async () => {
    const onCloseDeleteModalFn = jest.fn();

    const { store } = render(
      <TableModals
        selectedFileElement={csvElementDetailNotFetched}
        openDeleteModal={true}
        onCloseDeleteModal={onCloseDeleteModalFn}
        openEnrichStep1Modal={false}
        openEnrichStep2Modal={false}
        onCloseEnrichStep1Modal={jest.fn()}
        onCloseEnrichStep2Modal={jest.fn()}
      />,
    );

    // check if modal is correctly rendered
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    expect(screen.getByText('Delete CSV record')).toBeInTheDocument();

    const modalTextElement = screen.getByTestId('delete-modal-text');
    const expectedText = `Are you sure you want to delete ${truncateString(
      csvElementDetailNotFetched.original_file_name,
      60,
    )}?`;
    expect(modalTextElement.textContent).toBe(expectedText);

    //

    // // check if parent is not opened
    // expect(sortButton.parentElement).toHaveAttribute('aria-expanded', 'false');
    //
    // // check if headers are rendered
    // const headers = sortButton.parentElement.querySelectorAll('.header');
    // expect(headers).toHaveLength(5);
    //
    // // click on that button
    // fireEvent.click(sortButton);
    //
    // // check if parent is opened
    // expect(sortButton.parentElement).toHaveAttribute('aria-expanded', 'true');
    //
    // const options = within(sortButton.parentElement).queryAllByRole('option');
    // expect(options).toHaveLength(10);
    //
    // // click on Status (ASC) option
    // fireEvent.click(options[4]);
    //
    // // check if that information will be stored to redux store
    // await waitFor(() => {
    //   expect(store.getState().fileListParam).toEqual({
    //     ...defaultFileListParamState,
    //     sort: SortList.STATUS_ASC,
    //   });
    // });
  });
});
