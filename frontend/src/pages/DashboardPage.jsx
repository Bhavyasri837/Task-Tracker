import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AnalyticsCards from '../components/AnalyticsCards';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useDebounce from '../hooks/useDebounce';
import * as taskService from '../services/taskService';
import * as analyticsService from '../services/analyticsService';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  priority: '',
  sortBy: '',
  order: 'asc',
  page: 1,
  limit: 10
};

export default function DashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formMode, setFormMode] = useState(null); // null | 'create' | task object

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await taskService.getTasks({
        ...filters,
        search: debouncedSearch
      });
      setTasks(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.sortBy, filters.order, filters.page, filters.limit, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
    } catch {
      // Analytics failing shouldn't block the rest of the dashboard.
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refreshAll = () => {
    loadTasks();
    loadAnalytics();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreate = async (taskData) => {
    await taskService.createTask(taskData);
    setFormMode(null);
    refreshAll();
  };

  const handleUpdate = async (taskData) => {
    await taskService.updateTask(formMode._id, taskData);
    setFormMode(null);
    refreshAll();
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await taskService.deleteTask(task._id);
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-content">
        <AnalyticsCards analytics={analytics} />

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onCreateClick={() => setFormMode('create')}
        />

        <ErrorMessage message={error} />

        {loading ? (
          <LoadingSpinner label="Loading tasks..." />
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onEdit={(task) => setFormMode(task)}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {formMode && (
          <TaskForm
            initialTask={formMode === 'create' ? null : formMode}
            onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
            onCancel={() => setFormMode(null)}
          />
        )}
      </main>
    </div>
  );
}
