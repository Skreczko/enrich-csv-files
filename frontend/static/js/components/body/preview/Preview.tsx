import React, { CSSProperties, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '../Spinner';
import { useFetchPreviewChunk } from '../../hooks/useFetchPreviewChunk';
import NotFoundComponent from '../NotFoundComponent';
import { VariableSizeGrid as Grid } from 'react-window';

const Preview: React.FC = () => {
  const { uuid } = useParams();

  const [gridSize, setGridSize] = useState({
    width: window.innerWidth - 200,
    height: window.innerHeight - 65,
  });

  useEffect(() => {
    const handleResize = (): void => {
      setGridSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

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

  const CellContentStyle: CSSProperties = {
    whiteSpace: 'normal',
    padding: '5px 10px',
    overflow: 'auto',
    outline: '1px solid #222',
  };

  const HeaderCellStyle: CSSProperties = {
    padding: '5px 10px',
    overflow: 'auto',
    outline: '1px solid #222',
    backgroundColor: 'lightgray',
    fontWeight: 'bold',
  };

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
    <div>
      <Grid
        onItemsRendered={({ visibleRowStartIndex, visibleRowStopIndex }): any =>
          handleScrollDebounced({ visibleRowStartIndex, visibleRowStopIndex })
        }
        columnCount={foundPreviewDetail.headers.length + 1}
        columnWidth={(): number => 200}
        height={gridSize.height}
        rowCount={foundPreviewDetail.rows.length + 1}
        rowHeight={(): number => 50}
        width={gridSize.width}
      >
        {Cell}
      </Grid>
      {chunkLoading && <Spinner />}
    </div>
  );
};

export default Preview;
