import api from './axios';

export const login = (email, password) =>
    api.post('/auth/login', { email, password });

export const register = (email, password) =>
    api.post('/auth/register', { email, password });

export const logout = () =>
    api.post('/auth/logout');

export const refresh = (refreshToken) =>
    api.post('/auth/refresh', { refreshToken });
