import React, { useEffect, useRef, useState } from 'react';
import { UploadListWrapper } from './UploadList.styled';
import { TableManagement } from './table_management/TableManagement';
import { useFetchUploadList } from '../../hooks/useFetchUploadList';
import { UploadListTable } from './upload_list_table/UploadListTable';
import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { removeTasks, TaskType } from '../../../redux/TaskListReducer';
import { fetchTaskResults } from '../../../api/actions';
import { CeleryTaskStatus } from '../../../api/enums';
import { updateFileElement } from '../../../redux/FileListSlice';
import { useFetchUploadDetail } from '../../hooks/useFetchUploadDetail';
import { TableNavigation } from './table_management/TableNavigation';
import { setNotificationPopupOpen } from '../../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../../notification/NotificationPopup';

export const UploadList: React.FC = () => {
  const fetchListData = useFetchUploadList();
  const dispatch = useDispatch();
  const fetchDetailedData = useFetchUploadDetail();

  const taskObject: TaskType = useSelector((state: RootState) => state.taskList);

  // ref to keep informaction about timeout to be able to clear that
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callCounter = useRef(0);

  const timeoutTime = (): number => {
    // function which assing timeout if response is very long to not to spam requests to backend
    if (callCounter.current < 5) {
      return 2000;
    } else if (callCounter.current > 5 && callCounter.current < 10) {
      return 4000;
    } else {
      return 10000;
    }
  };

  const timeoutTaskDispatcher = (taskIds: string[]): void => {
    callCounter.current += 1;
    timeoutRef.current = setTimeout(() => {
      taskDispatcher(taskIds);
    }, timeoutTime());
  };

  const taskDispatcher = async (taskIds: string[]): Promise<any> => {
    const successIds: string[] = [];
    const pendingIds: string[] = [];
    const failureIds: string[] = [];

    try {
      const taskResults = await fetchTaskResults(taskIds);

      for (const [taskId, taskResult] of Object.entries(taskResults)) {
        const csvDetail = taskObject[taskId];
        if (csvDetail) {
          if (taskResult.status == CeleryTaskStatus.SUCCESS) {
            dispatch(
              updateFileElement({
                uuid: csvDetail.uuid,
                csv_detail: taskResult.results,
              }),
            );
            successIds.push(taskId);
          } else if (taskResult.status == CeleryTaskStatus.FAILURE) {
            fetchDetailedData(csvDetail.uuid);
            failureIds.push(taskId);
          } else if (taskResult.status == CeleryTaskStatus.PENDING) {
            pendingIds.push(taskId);
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (successIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.WARNING,
            content:
              'Response from external endpoint has been fetched successfully. Please specify columns to merge.',
          }),
        );
      }
      if (failureIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.ERROR,
            content: 'An error occurred during the fetching external response',
          }),
        );
      }
      clearTimeout(timeoutRef.current);
      dispatch(removeTasks([...successIds, ...failureIds]));
      if (pendingIds.length) {
        timeoutTaskDispatcher(pendingIds);
      }
    }
  };

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
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (!Object.keys(taskObject).length) {
        // for situation where all tasks has been finished.
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
