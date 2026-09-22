const PRIORITY_CLASS = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high'
};

const STATUS_CLASS = {
  Todo: 'badge-todo',
  'In Progress': 'badge-progress',
  Done: 'badge-done'
};

const formatDate = (date) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function TaskItem({ task, onEdit, onDelete, onToggleComplete }) {
  const isDone = task.status === 'Done';

  return (
    <div className={`task-item ${isDone ? 'task-item-done' : ''}`}>
      <div className="task-item-main">
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggleComplete(task)}
          aria-label={isDone ? 'Mark as not done' : 'Mark as completed'}
          className="task-checkbox"
        />
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            <span className={`badge ${STATUS_CLASS[task.status]}`}>{task.status}</span>
            <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
            <span className="task-due-date">{formatDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
      <div className="task-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );
}
