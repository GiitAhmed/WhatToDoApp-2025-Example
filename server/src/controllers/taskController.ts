import { Request, Response } from "express";
import TaskModel from "../models/taskModel";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await TaskModel.findAll();
    res.status(200).json(tasks);
  } catch (error: unknown) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const { name, content, startDate, endDate } = req.body;

  try {
    const newTask = await TaskModel.create({
      name,
      content,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    res.status(201).json(newTask);
  } catch (error: unknown) {
    res.status(500).json({ message: "Failed to create task" });
  }
};

// Delete existing task
export const deleteTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  try {
    const deletedTask = await TaskModel.destroy({ where: { taskId } }); // Delete task by id

    if (!deletedTask || deletedTask === 0) {
      res.status(404).json({ message: "Task not found" }); // Task cannot be found by id
    } else {
      res
        .status(200)
        .json({ message: "Task deleted successfully", task: deletedTask });
    }
  } catch (error) {
    res.status(500).json({ message: "Could not delete task" });
  }
};

// Update existing task by id
export const updateTask = async (req: Request, res: Response) => {
  const { taskId, name, content, startDate, endDate, status } = req.body;

  try {
    const updatedTask = await TaskModel.update(
      {
        name: name,
        content: content,
        startDate: startDate,
        endDate: endDate,
        status: status,
      },
      { where: { taskId } }
    );

    // If task cannot be found by id
    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
    } else {
      res.status(201).json(updatedTask);
    }
  } catch (error: unknown) {
    console.log(error);
    // If updating fails
    res.status(500).json({ message: "Could not update task" });
  }
};
