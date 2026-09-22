import api from './api';
export const getAnalytics = async () => {
  const { data } = await api.get('/api/analytics');
  return data.data;
};