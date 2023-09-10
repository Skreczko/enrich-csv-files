import React from 'react';
import { CustomTableRow } from './TableRow.styled';
import { CsvFileElement } from '../../../../api/types';
import moment from 'moment';

type Props = {
  fileElement: CsvFileElement;
};

export const TableRow: React.FC<Props> = ({ fileElement }) => {
  //     const getRowTextColor = (patient: Patient): string => {
  //   if (!patient.doctorId) {
  //     return "#E83B46";
  //   } else if (patient.status == UserStatus.PatientAccountArchived) {
  //     return "#84b1b5";
  //   } else if (patient.status == UserStatus.PatientSentForms) {
  //     return "#01d401";
  //   }
  //   return "#3c5153";
  // };
  const {
    original_file_name: fileName,
    created,
    file_row_count: fileRowsCount,
    status,
    source_original_file_name: sourceFileName,
    enrich_detail,
  } = fileElement;

  return (
    // <CustomTableRow color={getRowTextColor(patient)}>
    <CustomTableRow>
      <div>
        <p>{fileName}</p>
      </div>
      <div>
        <p>{moment(created).format('YYYY-MM-DD HH:mm:ss')}</p>
      </div>
      <div>
        <p>{status}</p>
      </div>
      <div>
        <p>{sourceFileName ?? '-'}</p>
      </div>
      <div>
        <p>{enrich_detail ? enrich_detail.external_url : '-'}</p>
      </div>
    </CustomTableRow>
  );
};
