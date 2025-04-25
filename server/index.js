const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to build WHERE clause for filtering
const buildWhereClause = (filters) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (filters.search) {
    conditions.push(`(LOWER(a.title) LIKE $${paramCount} OR LOWER(a.description) LIKE $${paramCount})`);
    values.push(`%${filters.search.toLowerCase()}%`);
    paramCount++;
  }

  if (filters.startDate) {
    conditions.push(`a.start_date >= $${paramCount}`);
    values.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    conditions.push(`a.end_date <= $${paramCount}`);
    values.push(filters.endDate);
    paramCount++;
  }

  if (filters.status) {
    if (filters.status === 'completed') {
      conditions.push(`(SELECT COUNT(*) = (SELECT COUNT(*) FROM tasks WHERE activity_id = a.activity_id) 
                      FROM tasks WHERE activity_id = a.activity_id AND completed = true)`);
    } else if (filters.status === 'in_progress') {
      conditions.push(`(SELECT COUNT(*) > 0 AND COUNT(*) < (SELECT COUNT(*) FROM tasks WHERE activity_id = a.activity_id)
                      FROM tasks WHERE activity_id = a.activity_id AND completed = true)`);
    } else if (filters.status === 'new') {
      conditions.push(`NOT EXISTS (SELECT 1 FROM tasks WHERE activity_id = a.activity_id)`);
    }
  }

  return {
    whereClause: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    values
  };
};

// Helper function to build ORDER BY clause
const buildOrderByClause = (sort) => {
  if (!sort) return 'ORDER BY a.created_at DESC';

  const orderBy = [];
  const { field, direction } = sort;

  switch (field) {
    case 'title':
      orderBy.push(`a.title ${direction}`);
      break;
    case 'start_date':
      orderBy.push(`a.start_date ${direction} NULLS LAST`);
      break;
    case 'end_date':
      orderBy.push(`a.end_date ${direction} NULLS LAST`);
      break;
    case 'status':
      orderBy.push(`
        CASE 
          WHEN NOT EXISTS (SELECT 1 FROM tasks WHERE activity_id = a.activity_id) THEN 1
          WHEN (SELECT COUNT(*) = (SELECT COUNT(*) FROM tasks WHERE activity_id = a.activity_id) 
                FROM tasks WHERE activity_id = a.activity_id AND completed = true) THEN 3
          ELSE 2
        END ${direction}
      `);
      break;
    default:
      return 'ORDER BY a.created_at DESC';
  }

  orderBy.push('a.created_at DESC');
  return 'ORDER BY ' + orderBy.join(', ');
};

// Get all activities with their tasks, including filtering, sorting, and searching
app.get('/api/activities', async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status
    };

    const sort = req.query.sort ? {
      field: req.query.sort,
      direction: req.query.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    } : null;

    const { whereClause, values } = buildWhereClause(filters);
    const orderByClause = buildOrderByClause(sort);

    const query = `
      SELECT 
        a.*,
        COALESCE(json_agg(
          CASE WHEN t.task_id IS NOT NULL THEN
            json_build_object(
              'task_id', t.task_id,
              'title', t.title,
              'completed', t.completed,
              'activity_id', t.activity_id,
              'created_at', t.created_at
            )
          ELSE NULL END
        ) FILTER (WHERE t.task_id IS NOT NULL), '[]') as tasks
      FROM activities a
      LEFT JOIN tasks t ON t.activity_id = a.activity_id
      ${whereClause}
      GROUP BY a.activity_id
      ${orderByClause}
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.json({ 
        activities: [],
        message: 'No activities found matching your criteria.'
      });
    }

    res.json({
      activities: result.rows,
      message: null
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create a new activity
app.post('/api/activities', async (req, res) => {
  const { title, description, url, start_date, end_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO activities (title, description, url, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING activity_id, title, description, url, start_date, end_date, created_at, updated_at`,
      [title, description, url, start_date, end_date]
    );

    const activity = { ...result.rows[0], tasks: [] };
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update an activity
app.patch('/api/activities/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, url, start_date, end_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE activities
       SET title = $1, description = $2, url = $3, start_date = $4, end_date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE activity_id = $6
       RETURNING activity_id, title, description, url, start_date, end_date, created_at, updated_at`,
      [title, description, url, start_date, end_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Get tasks for the updated activity
    const tasksResult = await pool.query(
      'SELECT * FROM tasks WHERE activity_id = $1',
      [id]
    );

    const activity = { ...result.rows[0], tasks: tasksResult.rows };
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete an activity
app.delete('/api/activities/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM activities WHERE activity_id = $1 RETURNING activity_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Create a new task
app.post('/api/activities/:activityId/tasks', async (req, res) => {
  const { activityId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, activity_id)
       VALUES ($1, $2)
       RETURNING task_id, title, completed, activity_id, created_at`,
      [title, activityId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task's completion status
app.patch('/api/activities/:activityId/tasks/:taskId', async (req, res) => {
  const { activityId, taskId } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status must be a boolean' });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET completed = $1
       WHERE task_id = $2 AND activity_id = $3
       RETURNING task_id, title, completed, activity_id, created_at`,
      [completed, taskId, activityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/activities/:activityId/tasks/:taskId', async (req, res) => {
  const { activityId, taskId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE task_id = $1 AND activity_id = $2 RETURNING task_id',
      [taskId, activityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get tasks for a specific activity
app.get('/api/activities/:activityId/tasks', async (req, res) => {
  const { activityId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE activity_id = $1 ORDER BY created_at DESC',
      [activityId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
};

// Add this near the top of the file, after the app.use() statements
const initDatabase = async () => {
  try {
    // Create activities table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        activity_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url TEXT,
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Activities table ready');

    // Create tasks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id SERIAL PRIMARY KEY,
        activity_id INTEGER REFERENCES activities(activity_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tasks table ready');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize database when server starts
initDatabase().then(() => {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}); 