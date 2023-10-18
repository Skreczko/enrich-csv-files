import React from 'react';
import { fireEvent, render, screen } from '../../../../../utils/testing-utils';
import { EnrichDetailStatus } from '../../../../../api/enums';
import { TableCellActions } from '../TableCellActions';
import { selectedCsvFileUuid } from '../../../../../utils/mockData';

type NavigateFn = (path: string) => void;

const mockNavigate: NavigateFn = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: (): NavigateFn => mockNavigate,
  };
});
describe('TableCellActions', () => {
  test.each([
    ['completed', EnrichDetailStatus.COMPLETED],
    ['awaiting for column selection', EnrichDetailStatus.AWAITING_COLUMN_SELECTION],
    ['other ie. failed enriching', EnrichDetailStatus.FAILED_ENRICHING],
  ])('Default render > status %s', (_, status: EnrichDetailStatus) => {
    render(
      <TableCellActions
        onOpenDeleteModal={jest.fn()}
        onOpenEnrichStep1Modal={jest.fn()}
        onOpenEnrichStep2Modal={jest.fn()}
        status={status}
        uuid={selectedCsvFileUuid}
      />,
    );
    const isStatusCompleted = status === EnrichDetailStatus.COMPLETED;

    expect(screen.getByTestId('table-cell-actions')).toBeInTheDocument();
    expect(screen.getByTestId('open-delete-modal-button')).toBeInTheDocument();
    if (isStatusCompleted) {
      expect(screen.getByTestId('open-enrich-step-1-modal-button')).toBeInTheDocument();
    } else if (status === EnrichDetailStatus.AWAITING_COLUMN_SELECTION) {
      expect(screen.getByTestId('open-enrich-step-2-modal-button')).toBeInTheDocument();
    }
    // preview icon should be only visible for EnrichDetailStatus.COMPLETED
    expect(screen.queryAllByTestId('open-preview')).toHaveLength(Number(isStatusCompleted));
  });

  test('Preview icon click', () => {
    render(
      <TableCellActions
        onOpenDeleteModal={jest.fn()}
        onOpenEnrichStep1Modal={jest.fn()}
        onOpenEnrichStep2Modal={jest.fn()}
        status={EnrichDetailStatus.COMPLETED}
        uuid={selectedCsvFileUuid}
      />,
    );

    fireEvent.click(screen.getByTestId('open-preview'));

    expect(mockNavigate).toHaveBeenCalledWith(`/${selectedCsvFileUuid}/preview`);
  });
});
