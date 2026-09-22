import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const toDateInputValue = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

export default function TaskForm({ initialTask, onSubmit, onCancel }) {
  const isEdit = Boolean(initialTask);

  const [form, setForm] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'Todo',
    priority: initialTask?.priority || 'Medium',
    dueDate: toDateInputValue(initialTask?.dueDate)
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        dueDate: form.dueDate || null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Task title"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Task description (optional)"
            rows={3}
          />

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={handleChange('status')}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" value={form.priority} onChange={handleChange('priority')}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange('dueDate')}
          />

          <ErrorMessage message={error} />

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
