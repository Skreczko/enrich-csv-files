import React, { useEffect, useRef, useState } from 'react';
import { UploadListWrapper } from './UploadList.styled';
import { TableManagement } from './table_management/TableManagement';
import { useFetchUploadList } from '../../hooks/useFetchUploadList';
import { UploadListTable } from './upload_list_table/UploadListTable';
import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { removeTasks, setTask, TaskType } from '../../../redux/TaskListReducer';
import { fetchTaskResults } from '../../../api/actions';
import { CeleryTaskStatus } from '../../../api/enums';
import { updateFileElement } from '../../../redux/FileListSlice';
import { CsvFileElement } from '../../../api/types';
import _ from 'lodash';
import { useFetchUploadDetail } from '../../hooks/useFetchUploadDetail';
import {TableNavigation} from "./table_management/TableNavigation";

export const UploadList: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const dispatch = useDispatch();
  const fetchDetailedData = useFetchUploadDetail();

  const runOnce = useRef(true);
  const taskObject: TaskType = useSelector((state: RootState) => state.taskList);

  const debouncedTaskHandler = _.debounce((taskIds: string[]) => {
    taskHandler(taskIds);
  }, 1000);

  const taskHandler = async (taskIds: string[]): Promise<any> => {
    const successIds: string[] = [];
    const pendingIds: string[] = [];

    try {
      const taskResults = await fetchTaskResults(taskIds);

      for (const [taskId, taskResult] of Object.entries(taskResults)) {
        const csvDetailUuid = taskObject[taskId].uuid;

        if (taskResult.status == CeleryTaskStatus.SUCCESS) {
          dispatch(
            updateFileElement({
              uuid: csvDetailUuid,
              csv_detail: taskResult.results,
            }),
          );
          successIds.push(taskId);
        } else if (taskResult.status == CeleryTaskStatus.FAILURE) {
          fetchDetailedData(csvDetailUuid);
        } else if (taskResult.status == CeleryTaskStatus.PENDING) {
          pendingIds.push(taskId);
        }
      }
    } catch (e) {
      console.log('error', e);
    } finally {
      dispatch(removeTasks(successIds));
      if (pendingIds.length) {
        debouncedTaskHandler(pendingIds);
      }
      runOnce.current = true;
    }
  };

  useEffect(() => {
    const taskList = Object.keys(taskObject);
    if (taskList.length && runOnce) {
      runOnce.current = false;
      taskHandler(taskList);
    }
  }, [taskObject]);

  useEffect(() => {
    console.log(1)
    fetchListData();
  }, []);

  return (
    <UploadListWrapper>
      <TableManagement />
      <UploadListTable />
      <TableNavigation />
    </UploadListWrapper>
  );
};
