import React, { useEffect, useState } from 'react';
import { DetailWrapper } from './TableRowDetailSection.styled';
import { TableRowDetailSourceFile } from './TableRowDetailSourceFile';
import { TableRowDetailEnrichDetail } from './TableRowDetailEnrichDetail';
import { TableRowDetailFile } from './TableRowDetailFile';
import { useFetchUploadDetail } from '../../../hooks/useFetchUploadDetail';
import { TableRowFullWidth } from './UploadListTable.styled';
import { Spinner } from '../../Spinner';
import { CsvFileElement } from '../../../../api/types';

type Props = {
  fileElement: CsvFileElement;
};

export const TableRowDetailSection: React.FC<Props> = ({ fileElement }) => {
  const fetchDetailedData = useFetchUploadDetail();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fileElement.fetchedDetailInfo) fetchDetailedData(fileElement.uuid);
    setIsLoading(false);
  }, []);

  return (
    <DetailWrapper>
      {isLoading ? (
        <TableRowFullWidth>
          <Spinner />
        </TableRowFullWidth>
      ) : (
        <>
          <TableRowDetailFile
            created={fileElement.created}
            file={fileElement.file}
            fileHeaders={fileElement.file_headers}
            fileName={fileElement.original_file_name}
            fileRows={fileElement.file_row_count}
            isFlat={fileElement?.enrich_detail?.is_flat}
            joinType={fileElement?.enrich_detail?.join_type}
            jsonRootPath={fileElement?.enrich_detail?.json_root_path}
            selectedHeader={fileElement?.enrich_detail?.selected_header}
            selectedKey={fileElement?.enrich_detail?.selected_key}
            uuid={fileElement.uuid}
          />
          {fileElement?.source_instance && (
            <TableRowDetailSourceFile
              created={fileElement.source_instance.created}
              file={fileElement.source_instance.file}
              fileHeaders={fileElement.source_instance.file_headers}
              fileName={fileElement.source_instance.original_file_name}
              fileRows={fileElement.source_instance.file_row_count}
              uuid={fileElement.source_instance.uuid}
            />
          )}
          {fileElement?.enrich_detail && fileElement?.source_instance && (
            <TableRowDetailEnrichDetail
              created={fileElement.enrich_detail.created}
              uuid={fileElement.enrich_detail.uuid}
              file={fileElement.enrich_detail?.external_response}
              responseElements={fileElement.enrich_detail?.external_elements_count}
              responseKeys={fileElement.enrich_detail?.external_elements_key_list}
            />
          )}
        </>
      )}
    </DetailWrapper>
  );
};
