import { useState } from "react";
import { TaskModel, TaskStatusEnum } from "../models/TaskModels";
import TaskModal from "./TaskModal";
import { format } from "date-fns";

interface TaskListProps {
  taskList: TaskModel[];
  onDeleteTask: (task: TaskModel) => void;
  onUpdateTask: (task: TaskModel) => void;
}

const TasksList = ({ taskList, onDeleteTask, onUpdateTask }: TaskListProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<TaskModel>();

  const handleEditClick = (task: TaskModel) => {
    setEditTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const getStatusBadgeClass = (status: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.new:
        return "badge badge-info"; // Blue for 'new'
      case TaskStatusEnum.inprogress:
        return "badge badge-warning"; // Yellow for 'inprogress'
      case TaskStatusEnum.done:
        return "badge badge-success"; // Green for 'done'
      default:
        return "badge badge-ghost"; // Default style
    }
  };

  return (
    <>
      <ul>
        {taskList.map((task: TaskModel, index: number) => (
          <li
            key={index}
            className="flex justify-between items-center bg-base-200 p-4 mb-2 rounded"
          >
            <span className={getStatusBadgeClass(task.status)}></span>
            <span>{task.name}</span>
            <span>{task.content}</span>
            <span>
              {task.startDate ? format(task.startDate, "dd/MM/yyyy") : ""}
            </span>
            <span>
              {task.endDate ? format(task.endDate, "dd/MM/yyyy") : ""}
            </span>
            <button
              className="btn btn-error"
              onClick={() => onDeleteTask(task)}
            >
              Delete
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleEditClick(task)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={onUpdateTask}
        initialData={editTask}
        mode={"edit"}
      />
    </>
  );
};

export default TasksList;
