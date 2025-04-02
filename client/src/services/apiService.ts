import axios, { AxiosError, AxiosResponse } from "axios";
import { TaskModel } from "../models/TaskModels";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // Backend url
  timeout: 5000, // Timeout after 5 seconds
});

export async function getTasksApi(): Promise<TaskModel[]> {
  try {
    const response: AxiosResponse = await apiClient.get("/tasks");
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(`Error fetching message: ${err.response?.data}`);
  }
}

export async function createTaskApi(newTask: TaskModel) {
  try {
    const response: AxiosResponse = await apiClient.post("/tasks", newTask);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(`Error fetching message: ${err.response?.data}`);
  }
}

export const deleteTaskApi = async (taskId: number): Promise<void> => {
  const response: AxiosResponse = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

export const updateTaskApi = async (task: TaskModel): Promise<TaskModel> => {
  const response: AxiosResponse = await apiClient.put("/tasks", task);
  return response.data;
};
