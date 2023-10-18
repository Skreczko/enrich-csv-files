import React, { CSSProperties, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../Spinner';
import { useFetchPreviewChunk } from '../../hooks/useFetchPreviewChunk';
import NotFoundComponent from '../NotFoundComponent';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer, { Size } from 'react-virtualized-auto-sizer';
import { CellContentStyle, HeaderCellStyle, PreviewWrapper } from './Preview.styled';

const Preview: React.FC = () => {
  const { uuid } = useParams();

  const {
    initialLoading,
    chunkLoading,
    notFound,
    foundPreviewDetail,
    handleScrollDebounced,
  } = useFetchPreviewChunk(uuid);

  if (notFound) {
    return <NotFoundComponent />;
  }

  if (initialLoading || !foundPreviewDetail) {
    return <Spinner />;
  }

  const Cell: React.FC<{
    columnIndex: number;
    rowIndex: number;
    style: CSSProperties;
  }> = React.memo(({ columnIndex, rowIndex, style }) => {
    Cell.displayName = 'Cell';

    if (rowIndex === 0) {
      return (
        <div style={{ ...style, ...HeaderCellStyle }}>
          {columnIndex === 0 ? '#' : foundPreviewDetail.headers[columnIndex - 1]}
        </div>
      );
    }

    const row = foundPreviewDetail.rows[rowIndex - 1];
    const content = columnIndex === 0 ? rowIndex : row[columnIndex - 1];

    return (
      <div style={{ ...style, ...CellContentStyle }} className='tableCellScrollbar'>
        {content}
      </div>
    );
  });

  return (
    <PreviewWrapper data-testid={'preview'}>
      <AutoSizer>
        {({ height, width }: Size): ReactNode => (
          <Grid
            onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }): any =>
              handleScrollDebounced({ visibleRowStartIndex, visibleRowStopIndex })
            }
            columnCount={foundPreviewDetail.headers.length + 1}
            columnWidth={(): number => 200}
            rowCount={foundPreviewDetail.rows.length + 1}
            rowHeight={(): number => 50}
            height={height}
            width={width}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
      {chunkLoading && <Spinner />}
    </PreviewWrapper>
  );
};

export default Preview;
