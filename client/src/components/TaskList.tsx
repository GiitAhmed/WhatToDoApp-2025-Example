interface TaskListProps {
  taskList: string[];
  onDeleteTask: (task: string) => void;
}

const TasksList = ({ taskList, onDeleteTask }: TaskListProps) => {
  return (
    <>
      <ul>
        {taskList.map((task: string, index: number) => (
          <li
            key={index}
            className="flex justify-between items-center bg-base-200 p-4 mb-2 rounded"
          >
            <span>{task}</span>
            <button
              className="btn btn-error"
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
