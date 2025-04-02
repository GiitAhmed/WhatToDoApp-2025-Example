import { useState } from "react";
import { TaskModel } from "../models/TaskModels";
import TaskModal from "./TaskModal";

interface CreateTaskProps {
  onCreateTask: (newTask: TaskModel) => void;
}

function CreateTask({ onCreateTask }: CreateTaskProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleFormSubmit = (newTask: TaskModel) => {
    onCreateTask(newTask);
  };

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button className="btn btn-primary mb-4" onClick={handleCreateClick}>
        New Task
      </button>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        mode={"create"}
      />
    </div>
  );
}

export default CreateTask;
