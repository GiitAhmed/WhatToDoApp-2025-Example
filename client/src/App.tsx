import React, { useState, useEffect, useCallback } from "react";
import './index.css';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiCalendar, FiLink, FiCheckSquare, FiSquare, FiExternalLink, FiClock } from 'react-icons/fi';
import { MdDashboard, MdTask } from 'react-icons/md';
import axios from 'axios';

// Add NodeJS type definition
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface Task {
  task_id: number;
  activity_id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Activity {
  activity_id: number;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
  tasks: Task[];
}

interface NewActivity {
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
}

interface FilterState {
  search: string;
  startDate: string;
  endDate: string;
  status: string;
  sort: string;
  direction: 'asc' | 'desc';
}

const API_URL = 'http://localhost:3001/api';
const ITEMS_PER_PAGE = 5;

// Date formatting utilities
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateForServer = (dateString: string | null): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString();
};

const initialNewActivity: NewActivity = {
  title: '',
  description: '',
  start_date: null,
  end_date: null
};

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<NewActivity>(initialNewActivity);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [view, setView] = useState<'activities' | 'tasks'>('activities');
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    startDate: '',
    endDate: '',
    status: '',
    sort: '',
    direction: 'asc'
  });

  const [message, setMessage] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300),
    []
  );

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Global error:', error);
      setError('An unexpected error occurred. Please try again.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Fetch activities from the API
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/activities`);
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        // Extract activities array from response
        const activitiesData = data.activities || [];
        // Ensure each activity has a tasks array
        const activitiesWithTasks = activitiesData.map((activity: Activity) => ({
          ...activity,
          tasks: activity.tasks || []
        }));
        setActivities(activitiesWithTasks);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  const handleActivityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: name.includes('date') ? (value || null) : value
    }));
  };

  const handleEditingActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingActivity) return;
    const { name, value } = e.target;
    setEditingActivity(prev => prev ? {
      ...prev,
      [name]: name.includes('date') ? (value ? value : null) : value
    } : null);
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Activity>(`${API_URL}/activities`, {
        title: newActivity.title,
        description: newActivity.description,
        start_date: formatDateForServer(newActivity.start_date),
        end_date: formatDateForServer(newActivity.end_date)
      });
      
      const createdActivity: Activity = {
        activity_id: response.data.activity_id,
        title: response.data.title,
        description: response.data.description,
        start_date: response.data.start_date,
        end_date: response.data.end_date,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        tasks: []
      };
      
      setActivities(prev => [...prev, createdActivity]);
      setNewActivity(initialNewActivity);
      setShowNewActivityForm(false);
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity');
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) {
      setError('Please select an activity first');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/activities/${selectedActivity.activity_id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: newTask.title,
          description: newTask.description 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const task = await response.json();
      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (activity.activity_id === selectedActivity.activity_id) {
            return {
              ...activity,
              tasks: activity.tasks ? [...activity.tasks, task] : [task]
            };
          }
          return activity;
        })
      );
      setNewTask({ title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleActivityDelete = async (activity_id: number) => {
    try {
      const response = await fetch(`${API_URL}/activities/${activity_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete activity');
      }

      setActivities(activities.filter(activity => activity.activity_id !== activity_id));
      if (selectedActivity?.activity_id === activity_id) {
        setSelectedActivity(null);
      }
      setError('');
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete activity. Please try again.');
    }
  };

  const handleTaskToggle = async (activityId: number, taskId: number, completed: boolean) => {
    try {
      if (!activityId || !taskId) {
        setError('Invalid activity or task ID');
        return;
      }

      const response = await fetch(`${API_URL}/activities/${activityId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (activity.activity_id === activityId) {
            return {
              ...activity,
              tasks: activity.tasks.map(task =>
                task.task_id === taskId ? { ...task, completed } : task
              )
            };
          }
          return activity;
        })
      );
    } catch (error) {
      setError('Error updating task: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleTaskDelete = async (activityId: number, taskId: number) => {
    try {
      if (!activityId || !taskId) {
        setError('Invalid activity or task ID');
        return;
      }

      const response = await fetch(`${API_URL}/activities/${activityId}/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (activity.activity_id === activityId) {
            return {
              ...activity,
              tasks: activity.tasks.filter(task => task.task_id !== taskId)
            };
          }
          return activity;
        })
      );
    } catch (error) {
      setError('Error deleting task: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const startEditingActivity = (activity: Activity) => {
    setEditingActivity({
      ...activity,
      tasks: activity.tasks || []
    });
  };

  const saveEditedActivity = async () => {
    if (!editingActivity || !editingActivity.activity_id) {
      setError('Cannot update activity: Invalid activity ID');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/activities/${editingActivity.activity_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingActivity.title,
          description: editingActivity.description,
          start_date: formatDateForServer(editingActivity.start_date),
          end_date: formatDateForServer(editingActivity.end_date)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update activity');
      }

      const updatedActivity: Activity = await response.json();
      updatedActivity.tasks = editingActivity.tasks; // Preserve tasks array
      setActivities(prev => prev.map(activity => 
        activity.activity_id === updatedActivity.activity_id ? updatedActivity : activity
      ));
      setEditingActivity(null);
    } catch (error) {
      setError('Error updating activity: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  function isActivity(item: Activity | Task): item is Activity {
    return 'tasks' in item && 'description' in item;
  }

  function getActivityStatus(activity: Activity): string {
    if (!activity.tasks.length) return 'pending';
    const completedTasks = activity.tasks.filter(task => task.completed);
    return completedTasks.length === activity.tasks.length ? 'completed' : 'in-progress';
  }

  const getCurrentItems = (items: (Activity | Task)[], searchTerm: string, statusFilter: string, dateFilter: string) => {
    return items.filter(item => {
      // Apply search filter
      const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isActivity(item) && item.description?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Apply status filter
      let statusMatch = true;
      if (statusFilter !== 'all') {
        if (isActivity(item)) {
          const hasCompletedTasks = item.tasks.some(task => task.completed);
          const hasIncompleteTasks = item.tasks.some(task => !task.completed);
          
          statusMatch = (statusFilter === 'completed' && hasCompletedTasks) ||
                       (statusFilter === 'in-progress' && hasIncompleteTasks);
        } else {
          statusMatch = (statusFilter === 'completed' && item.completed) ||
                       (statusFilter === 'in-progress' && !item.completed);
        }
      }

      // Apply date filter
      let dateMatch = true;
      if (dateFilter !== 'all' && isActivity(item)) {
        const today = new Date();
        const startDate = item.start_date ? new Date(item.start_date) : null;
        const endDate = item.end_date ? new Date(item.end_date) : null;

        if (dateFilter === 'today') {
          dateMatch = startDate ? startDate.toDateString() === today.toDateString() : false;
        } else if (dateFilter === 'upcoming') {
          dateMatch = startDate ? startDate > today : false;
        } else if (dateFilter === 'past') {
          dateMatch = endDate ? endDate < today : false;
        }
      }

      return searchMatch && statusMatch && dateMatch;
    });
  };

  const totalPages = Math.ceil(
    (view === 'activities' ? activities.length : selectedActivity?.tasks.length || 0) / ITEMS_PER_PAGE
  );

  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      direction: prev.sort === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getItemStatus = (item: Task | Activity): string => {
    if ('completed' in item) {
      return item.completed ? 'completed' : 'pending';
    }
    return item.start_date ? 'in_progress' : 'new';
  };

  const isTask = (item: Task | Activity): item is Task => {
    return 'task_id' in item;
  };

  const renderItem = (item: Activity | Task) => {
    if (isActivity(item)) {
      const status = getActivityStatus(item);
      return (
        <div key={item.activity_id} className="task-card">
          <div className="card-header">
            <div className={`status-dot ${status}`} />
            <div className="card-title-section">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-date">{item.created_at ? formatDateForDisplay(item.created_at) : 'No date'}</p>
            </div>
          </div>
          <p className="card-description">{item.description}</p>
          <div className="card-footer">
            <button 
              className="open-button"
              onClick={() => handleActivitySelect(item)}
            >
              Open
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item.task_id} className="task-card">
          <div className="card-header">
            <div className={`status-dot ${item.completed ? 'completed' : 'pending'}`} />
            <div className="card-title-section">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-date">{item.created_at ? formatDateForDisplay(item.created_at) : 'No date'}</p>
            </div>
          </div>
          <p className="card-description">{item.description}</p>
        </div>
      );
    }
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity({
      ...activity,
      tasks: activity.tasks ?? []
    });
    setView('tasks');
  };

  const closeNewActivityForm = () => {
    setNewActivity(initialNewActivity);
    setShowNewActivityForm(false);
  };

  // Remove URL references from activity display
  const renderActivityDetails = (activity: Activity) => (
    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
      <div className="flex items-center">
        <FiCalendar className="w-4 h-4 mr-2" />
        <span>Start: {formatDateForDisplay(activity.start_date)}</span>
      </div>
      <div className="flex items-center">
        <FiCalendar className="w-4 h-4 mr-2" />
        <span>End: {formatDateForDisplay(activity.end_date)}</span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading activities...</div>;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1 className="app-title">WhatToDo</h1>
        <nav>
          <button 
            className={`nav-button ${view === 'activities' ? 'active' : ''}`} 
            onClick={() => {
              setView('activities');
              setSelectedActivity(null);
            }}
          >
            Dashboard
          </button>
          <button 
            className={`nav-button ${view === 'tasks' ? 'active' : ''}`}
            onClick={() => setView('tasks')}
            disabled={!selectedActivity}
          >
            Tasks
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1 className="view-title">Tasks</h1>
          <div className="filter-bar">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="filter-select"
            >
              <option value="">Date</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <div className="task-grid">
            {getCurrentItems(activities, filters.search, filters.status || 'all', filters.startDate || 'all')
              .sort((a, b) => {
                const dateA = new Date(a.created_at || '');
                const dateB = new Date(b.created_at || '');
                return dateB.getTime() - dateA.getTime();
              })
              .map(renderItem)}
          </div>
        )}

        <button 
          className="add-new-button"
          onClick={() => setShowNewActivityForm(true)}
        >
          <FiPlus className="w-4 h-4" />
          New Task
        </button>

        {editingActivity && (
          <div className="edit-form-overlay" onClick={() => setEditingActivity(null)}>
            <div className="edit-activity-form" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Activity</h3>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editingActivity.title}
                  onChange={(e) => handleEditingActivityChange(e)}
                  name="title"
                  className="form-input"
                  placeholder="Activity title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={editingActivity.description}
                  onChange={(e) => handleEditingActivityChange(e)}
                  name="description"
                  className="form-input"
                  placeholder="Activity description"
                />
              </div>
              <div className="date-inputs">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(editingActivity.start_date)}
                    onChange={(e) => handleEditingActivityChange(e)}
                    name="start_date"
                    className="form-input date-picker"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(editingActivity.end_date)}
                    onChange={(e) => handleEditingActivityChange(e)}
                    name="end_date"
                    className="form-input date-picker"
                  />
                </div>
              </div>
              <div className="button-group">
                <button onClick={() => setEditingActivity(null)} className="cancel-button">
                  Cancel
                </button>
                <button onClick={saveEditedActivity} className="save-button">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewActivityForm && (
          <div className="edit-form-overlay" onClick={closeNewActivityForm}>
            <div className="edit-activity-form" onClick={(e) => e.stopPropagation()}>
              <div className="edit-form-header">
                <h2 className="edit-form-title">New Activity</h2>
                <button type="button" className="close-button" onClick={closeNewActivityForm}>&times;</button>
              </div>
              <form onSubmit={handleActivitySubmit} className="activity-form">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={handleActivityInputChange}
                    name="title"
                    className="form-input"
                    placeholder="Activity title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={newActivity.description}
                    onChange={handleActivityInputChange}
                    name="description"
                    className="form-input"
                    placeholder="Activity description"
                  />
                </div>
                <div className="date-inputs">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formatDateForInput(newActivity.start_date)}
                      onChange={handleActivityInputChange}
                      name="start_date"
                      className="form-input date-picker"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={formatDateForInput(newActivity.end_date)}
                      onChange={handleActivityInputChange}
                      name="end_date"
                      className="form-input date-picker"
                    />
                  </div>
                </div>
                <div className="button-group">
                  <button type="button" onClick={closeNewActivityForm} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Create Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

/* Erillaisia tyylejä määritellä React komponentteja / funktioita
  function App() {}
  const App = () => {}
  export default function App() {}
*/
