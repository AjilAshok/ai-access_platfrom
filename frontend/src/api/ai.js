import api from './axios';

export const getModels = () => api.get('/models');
export const generate = (model, prompt) => api.post('/ai/generate', { model, prompt });
export const getUserStats = () => api.get('/user/stats');
