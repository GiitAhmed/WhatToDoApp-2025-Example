import { useState } from 'react';

const App = () => {
  const [taskList, setTaskList] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask(e.target.value);
  };

  // Handle new task creation, by adding it into the list
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask) return;
    setTaskList([...taskList, newTask]);
    setNewTask('');
  }

  // Handle task deletion
  const deleteTask = (task: string) => {
    setTaskList(taskList.filter((listItem: string) => listItem !== task));
  };

  return (
    <>
      <div className="header">
        <h1>WhatToDo</h1>
      </div>
      <div className="container">
        <form>
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
        <ul>
          {taskList.map((task) => (
            <li>
              <span>{task}</span>
              <button
                className="delete-button"
                onClick={() => deleteTask(task)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default App;

/* Different ways to implement react components/functions
  function App() {}
  const App = () => {}
  export default function App() {}
*/
