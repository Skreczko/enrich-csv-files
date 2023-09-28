import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeTasks, setTask, TaskType } from '../../redux/TaskListReducer';
import { RootState } from '../../redux/store';
import { fetchTaskResults } from '../../api/actions';
import { CeleryTaskStatus, EnrichDetailStatus } from '../../api/enums';
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

  useEffect(() => {
    // This useEffect is responsible for initializing the task list from localStorage when the component mounts.
    // By doing this, we ensure that any tasks that were in progress or pending before a page refresh
    // are still available and can be tracked after the refresh.
    const parsedTaskList = JSON.parse(localStorage.getItem('taskList'));
    if (parsedTaskList && Object.keys(parsedTaskList).length) {
      dispatch(setTask(parsedTaskList));
    }
  }, []);

  useEffect(() => {
    // This useEffect observes changes in the taskObject and updates the localStorage accordingly.
    // By persisting the taskObject to localStorage, we can maintain the state of tasks across page refreshes.
    // This ensures that even if the user refreshes the page, the state of ongoing or pending tasks is not lost.
    localStorage.setItem('taskList', JSON.stringify(taskObject));
  }, [taskObject]);

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
    const successCompletedIds: string[] = [];
    const successNextStepdIds: string[] = [];
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
            if (taskResult.results.status === EnrichDetailStatus.COMPLETED)
              successCompletedIds.push(taskId);
            else successNextStepdIds.push(taskId);
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
      if (successNextStepdIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.INFO,
            content: 'Enrichment process completed successfully. Please proceed to the next step.',
          }),
        );
      }
      if (successCompletedIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.SUCCESS,
            content: 'Enrichment process completed successfully. Now you can preview your file(s).',
          }),
        );
      }
      if (failureIds.length) {
        dispatch(
          setNotificationPopupOpen({
            appearance: NotificationAppearanceEnum.ERROR,
            content: 'An error occurred during enrichment process.',
          }),
        );
      }
      clearTimeout(timeoutRef.current);
      dispatch(removeTasks([...successCompletedIds, ...successNextStepdIds, ...failureIds]));
      if (pendingIds.length) {
        timeoutTaskDispatcher(pendingIds);
      }
    }
  };

  return { timeoutTaskDispatcher, timeoutTime, clearTimeoutRef, callCounter };
};
