import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeTasks, TaskType } from '../../redux/TaskListReducer';
import { RootState } from '../../redux/store';
import { fetchTaskResults } from '../../api/actions';
import { CeleryTaskStatus } from '../../api/enums';
import { updateFileElement } from '../../redux/FileListSlice';
import { useFetchUploadDetail } from './useFetchUploadDetail';
import { setNotificationPopupOpen } from '../../redux/NotificationPopupSlice';
import { NotificationAppearanceEnum } from '../notification/NotificationPopup';

export const useTaskDispatcher = (): {
  callCounter: React.MutableRefObject<number>;
  clearTimeoutRef: () => void;
  timeoutTime: () => number;
  timeoutTaskDispatcher: (taskIds: string[]) => void;
} => {
  const dispatch = useDispatch();
  const fetchDetailedData = useFetchUploadDetail();
  const taskObject: TaskType = useSelector((state: RootState) => state.taskList);
  const callCounter = useRef(0);
  // ref to keep informaction about timeout to be able to clear that
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeoutRef = (): void => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const timeoutTime = (): number => {
    // determines the timeout duration based on the number of calls made.
    // this helps in avoiding spamming the backend with too many requests.
    if (callCounter.current < 5) {
      return 2000;
    } else if (callCounter.current > 5 && callCounter.current < 10) {
      return 5000;
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
            appearance: NotificationAppearanceEnum.INFO,
            content: 'Enrichment process completed successfully. Please proceed to the next step.',
          }),
        );
      }
      if (failureIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.ERROR,
            content: 'An error occurred enrichment process',
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

  return { timeoutTaskDispatcher, timeoutTime, clearTimeoutRef, callCounter };
};
