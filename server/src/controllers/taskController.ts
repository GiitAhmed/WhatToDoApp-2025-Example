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
