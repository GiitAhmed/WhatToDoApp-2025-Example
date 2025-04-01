import React, { useState } from "react";
import { createTaskApi } from "../services/apiService";
import { TaskModel } from "../models/TaskModels";

function CreateTask() {
  const [name, setName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTask: TaskModel = {
        taskId: 0,
        name,
        content,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      await createTaskApi(newTask);
      setMessage("Task created successfully");
      setName("");
      setContent("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      setMessage("Failed to create task");
    }
  };

  return (
    <div className="flex flex-col my-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create New Task
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Name:</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input input-bordered w-full"
            placeholder="Enter task name"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Content:</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="textarea textarea-bordered w-full"
            placeholder="Enter task content"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Start Date:</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">End Date:</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="input input-bordered w-full"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Create Task
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-lg font-medium text-green-600">
          {message}
        </p>
      )}
    </div>
  );
}

export default CreateTask;
