import { useEffect, useState } from "react";
import TaskList from "../components/TaskList";
import { getTasks } from "../services/apiService";

const Tasks = () => {
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kutsutaan erillistä API-kutsufunktiota
    getTasks()
      .then((data) => {
        setTaskList(data.tasks); // Asetetaan viesti newTask:lle
        //setError("Something went wrong!");
      })
      .catch((error) => {
        setError(error.message); // Asetetaan virheviesti
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask(e.target.value);
  };

  // Handle new task creation, by adding it into the list
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask) return;
    setTaskList([...taskList, newTask]);
    setNewTask("");
  }

  // Handle task deletion
  const handleDeleteTask = (task: string) => {
    setTaskList(taskList.filter((listItem: string) => listItem !== task));
  };

  return (
    <>
      <div className="card shadow-lg rounded-lg p-4 max-w-lg">
        <h2 className="text-4xl font-bold mb-4">Tasks</h2>
        <div className="flex mb-4">
          <input
            type="text"
            className="input input-bordered w-full"
            value={newTask}
            placeholder="New task"
            onChange={handleChange}
          />
          <button
            className="btn btn-success ml-2"
            type="button"
            onClick={handleSubmit}
          >
            Add new task
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <TaskList taskList={taskList} onDeleteTask={handleDeleteTask} />
        )}
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
      </div>
    </>
  );
};

export default Tasks;
