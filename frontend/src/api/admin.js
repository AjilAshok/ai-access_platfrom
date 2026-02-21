import api from './axios';

export const getUsers = () => api.get('/admin/users');

export const updateLimit = (id, daily_limit) =>
    api.patch(`/admin/users/${id}/limit`, { daily_limit });

export const updateStatus = (id, is_active) =>
    api.patch(`/admin/users/${id}/status`, { is_active });

export const getDailyAnalytics = () => api.get('/admin/analytics/daily');
export const getUserAnalytics = () => api.get('/admin/analytics/users');
export const getModelAnalytics = () => api.get('/admin/analytics/models');
