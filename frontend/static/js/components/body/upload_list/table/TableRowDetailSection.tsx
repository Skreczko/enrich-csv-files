import React, { useEffect, useState } from 'react';
import { DetailWrapper } from './TableRowDetailSection.styled';
import { TableRowDetailSourceFile } from './TableRowDetailSourceFile';
import { TableRowDetailEnrichUrl } from './TableRowDetailEnrichUrl';
import { TableRowDetailFile } from './TableRowDetailFile';
import { useFetchUploadDetail } from '../useFetchUploadDetail';
import { TableRowFullWidth } from './UploadTable.styled';
import { Spinner } from '../../Spinner';
import { CsvFileElement } from '../../../../api/types';

type Props = {
  fileElement: CsvFileElement;
};

export const TableRowDetailSection: React.FC<Props> = ({ fileElement }) => {
  const fetchDetailedData = useFetchUploadDetail();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetailedData(fileElement.uuid).then(() => setIsLoading(false));
  }, []);

  return (
    <DetailWrapper>
      {isLoading ? (
        <TableRowFullWidth>
          <Spinner />
        </TableRowFullWidth>
      ) : (
        <>
          <TableRowDetailFile />
          <TableRowDetailSourceFile />
          <TableRowDetailEnrichUrl />
        </>
      )}
    </DetailWrapper>
  );
};
