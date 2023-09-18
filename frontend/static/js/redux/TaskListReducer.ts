import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TaskDetail = {
  instance: 'CsvFile' | 'EnrichDetail';
  uuid: string;
};

export type TaskType = { [key: string]: TaskDetail };

const taskListSlice = createSlice({
  name: 'taskList',
  initialState: {} as TaskType,
  reducers: {
    setTask: (state, { payload: task }: PayloadAction<TaskType>) => {
      return { ...state, ...task };
    },

    removeTasks: (state, { payload: removeTaskList }: PayloadAction<string[]>) => {
      removeTaskList.forEach(taskId => {
        delete state[taskId];
      });
    },
  },
});

export const { setTask, removeTasks } = taskListSlice.actions;

export default taskListSlice.reducer;
