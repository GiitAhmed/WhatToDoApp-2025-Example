# WhatToDo App

A task management application that allows users to create activities (epic-level tasks) and associate tasks with them.

## Features

- Create and manage activities (epic-level tasks)
- Add tasks to activities
- Mark tasks as completed
- Delete activities and tasks
- Store data in a SQLite database

## Project Structure

- `client/`: Frontend React application
- `server/`: Backend Express server with SQLite database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Running the Application

1. Start the server:

```bash
cd server
npm run dev
```

2. In a new terminal, start the client:

```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Database Schema

### Activities Table

- `activityId`: Unique automatically generated numeric ID
- `name`: String for activity name/title
- `content`: String for activity content/description
- `url`: String for activity related URL
- `startDate`: Date when activity begins
- `endDate`: Date when activity ends

### Tasks Table

- `taskId`: Unique automatically generated numeric ID
- `title`: String for task title
- `activityId`: Foreign key referencing the Activities table
- `completed`: Boolean indicating if the task is completed

## API Endpoints

### Activities

- `GET /api/activities`: Get all activities
- `GET /api/activities/:id`: Get a single activity by ID
- `POST /api/activities`: Create a new activity
- `PUT /api/activities/:id`: Update an activity
- `DELETE /api/activities/:id`: Delete an activity

### Tasks

- `GET /api/activities/:id/tasks`: Get all tasks for a specific activity
- `POST /api/activities/:id/tasks`: Create a new task for an activity
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task
