import { useEffect, useState } from "react";
import { TaskModel } from "../models/TaskModels";
import { getTasksApi } from "../services/apiService";
import TaskChart from "../components/TaskChart";

const Dashboard = () => {
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
  return (
    <>
      <div>
        <h2 className="text-4xl font-bold mb-4">Dashboard</h2>
        {loading ? <div>Loading...</div> : <TaskChart tasks={taskList} />}
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
    </>
  );
};

export default Dashboard;
