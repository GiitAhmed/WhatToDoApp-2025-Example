import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { TaskModel, TaskStatusEnum } from "../models/TaskModels";

// Register components for Chart.js (needed for Chart.js v3+)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TaskChartProps {
  tasks: TaskModel[];
}

const TaskChart = ({ tasks }: TaskChartProps) => {
  // Count tasks by status
  const newCount = tasks.filter((t) => t.status === TaskStatusEnum.new).length;
  const inProgressCount = tasks.filter(
    (t) => t.status === TaskStatusEnum.inprogress
  ).length;
  const doneCount = tasks.filter(
    (t) => t.status === TaskStatusEnum.done
  ).length;

  const totalTasks = tasks.length;

  // Prepare data for chart
  const data = {
    labels: ["New", "In Progress", "Done"],
    datasets: [
      {
        label: "",
        data: [newCount, inProgressCount, doneCount],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Tasks by Status (Total Tasks: ${totalTasks})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="card bg-neutral shadow-lg p-4 rounded-lg w-full md:w-1/2">
      <div className="card-body">
        <h2 className="card-title text-xl font-bold">Task Status Overview</h2>
        <div style={{ height: "300px" }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default TaskChart;
