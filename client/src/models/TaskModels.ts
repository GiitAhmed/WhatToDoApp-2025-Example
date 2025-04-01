export type TaskListModel = {
  tasks: TaskModel[] | null;
};

export type TaskModel = {
  taskId: number;
  name: string;
  content: string;
  startDate?: Date | null;
  endDate?: Date | null;
};
