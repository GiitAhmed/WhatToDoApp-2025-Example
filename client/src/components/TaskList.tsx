interface TaskListProps {
  taskList: string[];
  onDeleteTask: (task: string) => void;
}

const TasksList = ({ taskList, onDeleteTask }: TaskListProps) => {
  return (
    <>
      <ul className="task-list">
        {taskList.map((task: string, index: number) => (
          <li key={index}>
            <span>{task}</span>
            <button
              className="delete-button"
              onClick={() => onDeleteTask(task)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TasksList;
