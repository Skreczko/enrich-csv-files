import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FileListState, updateFileElement } from '../../../redux/FileListSlice';
import { RootState } from '../../../redux/store';
import { NotFoundComponent } from '../NotFoundComponent';
import { fetchChunkData, fetchUploadDetails } from '../../../api/actions';
import { UploadStateEnum } from '../upload_csv/types';
import { PreviewDetail, PreviewType, setChunkData } from '../../../redux/PreviewListReducer';
import { Table } from 'semantic-ui-react';
import { UploadElementState } from '../../../redux/UploadSectionSlice';
import { Spinner } from '../Spinner';

export const Preview: React.FC = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const previewList: PreviewType = useSelector((state: RootState) => state.previewList);

  const [loading, setLoading] = useState(false);

  const foundPreviewDetail = previewList[uuid];

  useEffect(() => {
    // setting uploading state
    setLoading(true);

    (async (): Promise<void> => {
      try {
        const { chunk_number, chunk_size, headers, rows } = await fetchChunkData(uuid);
        dispatch(
          setChunkData({
            [uuid]: { lastChunkNumber: chunk_number, chunkSize: chunk_size, headers, rows },
          }),
        );
      } catch (error) {
        console.log(error);
      }
    })();
    setLoading(false);
  }, []);

  if (loading) <Spinner />;

  if (!foundPreviewDetail && !loading) {
    return <NotFoundComponent />;
  }

  return (
    <div>
      <Table celled singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            {foundPreviewDetail.headers.map(header => (
              <Table.HeaderCell>{header}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {foundPreviewDetail.rows.map((row, i) => (
            <Table.Row>
              <Table.Cell>{i + 1}</Table.Cell>
              {row.map(cell => (
                <Table.Cell>{cell}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
