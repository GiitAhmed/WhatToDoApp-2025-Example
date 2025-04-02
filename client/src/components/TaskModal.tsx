import { useEffect, useState } from "react";
import { TaskModel, TaskStatusEnum } from "../models/TaskModels";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskModel) => void;
  initialData?: TaskModel;
  mode: string;
}

function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: TaskModalProps) {
  const [taskData, setTaskData] = useState<TaskModel>({
    taskId: 0,
    name: "",
    content: "",
    startDate: null,
    endDate: null,
    status: TaskStatusEnum.new,
  });

  // Populate form fields when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTaskData(initialData);
    }
  }, [initialData, mode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value) as TaskStatusEnum;
    setTaskData((prevData) => ({
      ...prevData,
      status: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value ? new Date(value) : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(taskData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open ">
      <div className="modal-box w-xs bg-neutral border border-base-200 p-4 rounded-box">
        <div className="flex justify-between">
          <h2 className="font-bold text-xl mb-4">
            {mode === "edit" ? "Edit Task" : "Create Task"}
          </h2>
          <button className="btn btn-danger" onClick={onClose}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name:</legend>
            <input
              name="name"
              value={taskData.name}
              onChange={handleChange}
              required
              className="input input-bordered"
            />
            <legend className="fieldset-legend">Content:</legend>
            <textarea
              name="content"
              value={taskData.content}
              onChange={handleChange}
              className="textarea textarea-bordered"
            />
            <legend className="fieldset-legend">Start Date:</legend>
            <input
              type="date"
              name="startDate"
              value={
                taskData.startDate
                  ? format(taskData.startDate, "yyyy-MM-dd")
                  : ""
              }
              onChange={handleDateChange}
              className="input input-bordered"
            />
            <legend className="fieldset-legend">End Date:</legend>
            <input
              type="date"
              name="endDate"
              value={
                taskData.endDate ? format(taskData.endDate, "yyyy-MM-dd") : ""
              }
              onChange={handleDateChange}
              className="input input-bordered"
            />
            <legend className="fieldset-legend">Status:</legend>
            <select
              className="select select-bordered"
              name="status"
              value={taskData.status ? taskData.status : TaskStatusEnum.new}
              onChange={handleStatusChange}
            >
              <option value="" disabled>
                -- Select Status --
              </option>
              <option value={TaskStatusEnum.new}>
                {TaskStatusEnum[TaskStatusEnum.new]}{" "}
              </option>
              <option value={TaskStatusEnum.inprogress}>
                {TaskStatusEnum[TaskStatusEnum.inprogress]}{" "}
              </option>
              <option value={TaskStatusEnum.done}>
                {TaskStatusEnum[TaskStatusEnum.done]}{" "}
              </option>
            </select>
          </fieldset>
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default TaskModal;
