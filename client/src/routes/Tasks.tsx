import { useEffect, useState } from "react";
import TaskList from "../components/TaskList";
import {
  createTaskApi,
  deleteTaskApi,
  updateTaskApi,
  getTasksApi,
} from "../services/apiService";
import { TaskModel } from "../models/TaskModels";
import CreateTask from "../components/CreateTask";

const Tasks = () => {
  const [message, setMessage] = useState<string>("");

  const [taskList, setTaskList] = useState<TaskModel[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    getTasksApi()
      .then((data) => {
        setTaskList(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle task deletion
  const handleDeleteTask = async (task: TaskModel) => {
    if (task.taskId) {
      setLoading(true);
      await deleteTaskApi(task.taskId)
        .then(() => {
          setMessage("Task was deleted");
          getTasks();
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleUpdateTask = (task: TaskModel) => {
    setLoading(true);
    updateTaskApi(task)
      .then((data: TaskModel) => {
        console.log("Task updated", data);
        setMessage("Task was updated");
        getTasks();
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateTask = (task: TaskModel) => {
    setLoading(true);
    createTaskApi(task)
      .then((newTask: TaskModel) => {
        console.log("Created new task", newTask.name);
        setMessage("Created new task: " + newTask.name);
        getTasks();
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-4">Tasks</h2>
      <div className="card shadow-lg rounded-lg p-4 bg-neutral">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <TaskList
              taskList={taskList}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          </div>
        )}
        <div className="flex mb-4">
          <CreateTask onCreateTask={handleCreateTask} />
        </div>
        {error && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>{message}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
