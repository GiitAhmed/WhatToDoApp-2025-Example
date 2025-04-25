import React from 'react';
import { Activity } from '../types/Activity';
import { FiEdit2, FiTrash2, FiCheck, FiClock } from 'react-icons/fi';

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'completed':
        return <FiCheck className="status-icon completed" />;
      case 'in_progress':
        return <FiClock className="status-icon in-progress" />;
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div className="status-indicator">
          {getStatusIcon()}
          <span className="status-text">{activity.status}</span>
        </div>
        <div className="task-card-actions">
          <button
            className="icon-button"
            onClick={() => onEdit(activity)}
            title="Edit activity"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="icon-button delete"
            onClick={() => onDelete(activity.id)}
            title="Delete activity"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="task-card-title">{activity.title}</h3>
      <p className="task-card-description">{activity.description}</p>

      {activity.url && (
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="task-card-link"
        >
          View Resource
        </a>
      )}

      <div className="task-card-footer">
        <div className="task-dates">
          {activity.start_date && (
            <span className="date-label">
              Start: {new Date(activity.start_date).toLocaleDateString()}
            </span>
          )}
          {activity.end_date && (
            <span className="date-label">
              Due: {new Date(activity.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
        <button
          className={`status-toggle-button ${activity.status}`}
          onClick={() => onToggleStatus(activity.id)}
        >
          Toggle Status
        </button>
      </div>
    </div>
  );
};

export default ActivityCard; 