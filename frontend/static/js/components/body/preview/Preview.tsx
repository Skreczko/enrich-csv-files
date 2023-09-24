/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FileListState, updateFileElement } from '../../../redux/FileListSlice';
import { RootState } from '../../../redux/store';
import { NotFoundComponent } from '../NotFoundComponent';
import { fetchChunkData } from '../../../api/actions';
import { PreviewType, setChunkData } from '../../../redux/PreviewListReducer';
import { Table } from 'semantic-ui-react';
import { Spinner } from '../Spinner';
import { useFetchPreviewChunk } from '../../hooks/useFetchPreviewChunk';

export const Preview: React.FC = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const previewList: PreviewType = useSelector((state: RootState) => state.previewList);

  // const [loading, setLoading] = useState(false);
  // const [notFound, setNotFound] = useState(false);

  const { loading, notFound, foundPreviewDetail, handleScroll } = useFetchPreviewChunk(uuid);

  const containerRef = useRef(null);

  // const foundPreviewDetail = previewList[uuid];

  // useEffect(() => {
  //   // setting uploading state
  //   setLoading(true);
  //
  //   (async (): Promise<void> => {
  //     try {
  //       const { chunk_number, chunk_size, headers, rows, file_row_count } = await fetchChunkData(
  //         uuid,
  //       );
  //       dispatch(
  //         setChunkData({
  //           [uuid]: {
  //             chunkSize: chunk_size,
  //             headers,
  //             lastChunkNumber: chunk_number,
  //             rows,
  //             totalRows: file_row_count,
  //           },
  //         }),
  //       );
  //     } catch (error) {
  //       setNotFound(true);
  //     }
  //   })();
  //   setLoading(false);
  // }, []);

  if (notFound) {
    return <NotFoundComponent />;
  }

  if (loading || !foundPreviewDetail) {
    return <Spinner />;
  }



  return (
    <div ref={containerRef} onScroll={(): void => handleScroll(containerRef.current)}>
      <Table celled singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            {foundPreviewDetail.headers.map(header => (
              <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {foundPreviewDetail.rows.map((row, rowIndex) => (
            <Table.Row key={`row-${rowIndex}`}>
              <Table.Cell>{rowIndex + 1}</Table.Cell>
              {row.map((cell, cellIndex) => (
                <Table.Cell key={`cell-${cellIndex}`}>{cell}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
