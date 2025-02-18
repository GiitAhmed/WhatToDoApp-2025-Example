import { useState } from "react";
import TaskList from "../components/TaskList";

const Tasks = () => {
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");

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
      <div className="task-container">
        <h1>Tasks</h1>
        <div className="task-content">
          <form className="task-input">
            <input
              type="text"
              value={newTask}
              placeholder="New task"
              onChange={handleChange}
            />
            <button type="submit" onClick={handleSubmit}>
              Add new task
            </button>
          </form>
          <TaskList taskList={taskList} onDeleteTask={handleDeleteTask} />
        </div>
      </div>
    </>
  );
};

export default Tasks;
