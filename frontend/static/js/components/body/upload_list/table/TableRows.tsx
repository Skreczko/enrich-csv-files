import React, { ReactElement } from 'react';
import { FileListState } from '../../../../redux/FileListSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { NoRecordWrapper } from './TableRows.styled';
import SandClockImage from '../../../../../img/body/list/sand-clock.png';
import { TableRow } from './TableRow';

export const TableRows: React.FC = () => {
  const { fileList }: FileListState = useSelector((state: RootState) => state.fileList);
  return (
    <div>
      {fileList?.length ? (
        fileList.map(fileElement => <TableRow key={fileElement.uuid} fileElement={fileElement} />)
      ) : (
        <NoRecordWrapper>
          <img src={SandClockImage} alt={'sand-clock'} />
          <p>There are no uploaded files yet</p>
        </NoRecordWrapper>
      )}
    </div>
  );
};
