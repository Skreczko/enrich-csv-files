/* eslint-disable @typescript-eslint/no-var-requires */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { FileListState } from '../../../../redux/FileListSlice';
import { RootState } from '../../../../redux/store';
import { Spinner } from '../../Spinner';
import { CustomTable, TableRowFullWidth } from './UploadTable.styled';
import { TableHeader } from './TableHeader';
import { TableRows } from './TableRows';

export const UploadTable: React.FC = () => {
  const { isLoading }: FileListState = useSelector((state: RootState) => state.fileList);

  // const patientList: Patient[] = patientListData?.result?.map(data => new Patient(data)) || [];

  // useEffect(() => {
  //   let intervalId: any;
  //   if (patientList?.length) {
  //     intervalId = setInterval(() => {
  //       unreadMessageList({
  //         patientIds: patientList?.map(patient => patient.id),
  //         token,
  //       }).then(unreadList => {
  //         let updatePatientListData = false;
  //         const currentPatientListData = [...patientListData.result];
  //         for (const messageElement of unreadList) {
  //           for (let i = 0; i < currentPatientListData.length; i++) {
  //             if (messageElement.patient_id == currentPatientListData[i].id) {
  //               if (messageElement.unread_message != currentPatientListData[i].unread_message) {
  //                 updatePatientListData = true;
  //                 currentPatientListData[i] = {
  //                   ...currentPatientListData[i],
  //                   unread_message: messageElement.unread_message,
  //                 };
  //               }
  //             }
  //           }
  //         }
  //         if (updatePatientListData) {
  //           store.dispatch(
  //             setPatientListMainTable({
  //               ...patientListData,
  //               result: currentPatientListData,
  //             }),
  //           );
  //         }
  //       });
  //     }, 10000);
  //   }
  //   return (): void => {
  //     clearInterval(intervalId);
  //   };
  // }, [patientList?.map(patient => patient.id).join(',')]);

  return (
    <CustomTable>
      <TableHeader />
      {isLoading ? (
        <TableRowFullWidth>
          <Spinner />
        </TableRowFullWidth>
      ) : (
        <TableRows />
      )}
    </CustomTable>
  );
};
