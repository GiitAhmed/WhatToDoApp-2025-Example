import React, { useState } from 'react';
import { Activity } from '../types/Activity';
import { FiPlus, FiSearch, FiCalendar, FiFilter } from 'react-icons/fi';
import ActivityCard from './ActivityCard';
import EditActivityForm from './EditActivityForm';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onAdd: (activity: Activity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onEdit,
  onDelete,
  onToggleStatus,
  onAdd,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || activity.dueDate.includes(filterDate);
    const matchesStatus = !filterStatus || activity.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div>
      <div className="content-header">
        <h1 className="view-title">Activities</h1>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ flex: 2 }}>
          <FiSearch size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <FiCalendar size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-picker"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <FiFilter size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-select"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="task-grid">
        {filteredActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>

      <button
        className="add-new-button"
        onClick={() => setShowAddForm(true)}
      >
        <FiPlus size={20} />
        <span>Add Activity</span>
      </button>

      {showAddForm && (
        <div className="edit-form-overlay">
          <EditActivityForm
            onSubmit={(activity) => {
              onAdd(activity);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ActivityList; 