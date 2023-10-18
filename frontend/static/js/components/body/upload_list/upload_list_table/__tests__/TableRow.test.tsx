import React from 'react';
import { fireEvent, render, screen } from '../../../../../utils/testing-utils';
import {
  csvElementDetailEnrichStep2,
  csvElementDetailEnrichStep2Failed,
  csvElementDetailFetched,
} from '../../../../../utils/mockData';
import { RootState } from '../../../../../redux/store';
import { TableRow } from '../TableRow';
import { CsvFileElement } from '../../../../../api/types';
import { statusDetails } from '../TableRows';
import { EnrichDetailStatus } from '../../../../../api/enums';

describe('TableRow', () => {
  const renderTableRow = (fileElement: CsvFileElement): RootState => {
    const { store } = render(
      <TableRow
        counter={1}
        fileElement={fileElement}
        onOpenDeleteModal={jest.fn()}
        onOpenEnrichStep1Modal={jest.fn()}
        onOpenEnrichStep2Modal={jest.fn()}
        statusDetail={statusDetails[fileElement.status]}
      />,
    );
    return store;
  };

  test.each([
    ['Completed', csvElementDetailFetched],
    ['Awaiting for column selection', csvElementDetailEnrichStep2],
    ['Failed', csvElementDetailEnrichStep2Failed],
  ])('Default render > CsvElement status: %s', (_, fileElement: CsvFileElement) => {
    renderTableRow(fileElement);
    const isStatusCompleted = fileElement.status == EnrichDetailStatus.COMPLETED;
    // check if component is correctly rendered
    expect(screen.getByTestId('table-row')).toBeInTheDocument();
    // check table content
    const tableCells = screen.queryAllByTestId('table-cell');

    // number of element
    expect(tableCells[0].textContent).toBe('1');
    // csv file name
    expect(tableCells[1].textContent).toContain(
      isStatusCompleted ? 'users_posts_audience.csv_enriched.csv' : '...',
    );
    // creating datetime
    expect(tableCells[2].innerHTML).not.toBe('');

    // status
    if (isStatusCompleted) {
      // icon
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
      expect(screen.queryAllByTestId('status-progress-bar')).toHaveLength(0);
    } else {
      // progress bar
      expect(screen.queryAllByTestId('status-icon')).toHaveLength(0);
      expect(screen.getByTestId('status-progress-bar')).toBeInTheDocument();
    }
    // original csv file name
    expect(tableCells[4].textContent).toContain('users_posts_audience.csv');
    // url used to enrich
    expect(tableCells[5].textContent).toContain('https://example.com');

    // action cell
    expect(screen.getByTestId('table-cell-actions')).toBeInTheDocument();
  });
  test('Open/Close TableRowDetailSection', () => {
    renderTableRow(csvElementDetailFetched);

    const csvFileName = screen.queryAllByTestId('table-cell')[1];

    // check if TableRowDetailSection is not yet opened
    expect(screen.queryAllByTestId('table-row-detail-section')).toHaveLength(0);

    // click to open TableRowDetailSection
    fireEvent.click(csvFileName);

    // check if TableRowDetailSection is opened
    expect(screen.getByTestId('table-row-detail-section')).toBeInTheDocument();

    // same click to close
    fireEvent.click(csvFileName);

    // check if TableRowDetailSection is closed
    expect(screen.queryAllByTestId('table-row-detail-section')).toHaveLength(0);
  });
});
