import React, { useEffect } from 'react';
import { UploadListWrapper } from './UploadList.styled';
import { TableManagement } from './table_management/TableManagement';
import { useFetchUploadList } from '../../hooks/useFetchUploadList';
import { UploadListTable } from './upload_list_table/UploadListTable';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import { TaskType } from '../../../redux/TaskListReducer';

import { TableNavigation } from './table_management/TableNavigation';
import { useTaskDispatcher } from '../../hooks/useTaskDispatcher';

export const UploadList: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const { timeoutTaskDispatcher, clearTimeoutRef, callCounter } = useTaskDispatcher();

  const taskObject: TaskType = useSelector((state: RootState) => state.taskList);

  useEffect(() => {
    // taskObject contain all tasks in pushed to redux
    // each time we got status success / failure from celery - related records will be removed
    // taskObject contains only tasks just initiated or tasks with celery response "pending"
    const taskList = Object.keys(taskObject);
    if (taskList.length) {
      timeoutTaskDispatcher(taskList);
    }
    return (): void => {
      // clear current timeout every component close
      clearTimeoutRef();
      if (!Object.keys(taskObject).length) {
        // for situation where all tasks have been finished.
        callCounter.current = 0;
      }
    };
  }, [taskObject]);

  useEffect(() => {
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
