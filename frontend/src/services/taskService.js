import api from './api';

// filters: { status, priority, search, page, limit, sortBy, order }
export const getTasks = async (filters = {}) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  const { data } = await api.get('/api/tasks', { params });

  return data; // { success, data: [...tasks], pagination }
};

export const getTaskById = async (id) => {
  const { data } = await api.get(`/api/tasks/${id}`);

  return data.data;
};

export const createTask = async (task) => {
  const { data } = await api.post('/api/tasks', task);

  return data.data;
};

export const updateTask = async (id, task) => {
  const { data } = await api.put(`/api/tasks/${id}`, task);

  return data.data;
};

export const deleteTask = async (id) => {
  await api.delete(`/api/tasks/${id}`);
};