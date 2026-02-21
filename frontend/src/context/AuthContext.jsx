import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem('accessToken') || null
    );

    const login = useCallback(async (email, password) => {
        const { data } = await loginApi(email, password);
        const payload = parseJwt(data.accessToken);
        const userData = { id: payload.id, role: payload.role, email };
        setUser(userData);
        setAccessToken(data.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return userData;
    }, []);

    const logout = useCallback(async () => {
        try { await logoutApi(); } catch { /* ignore */ }
        setUser(null);
        setAccessToken(null);
        localStorage.clear();
        toast.success('Logged out');
    }, []);

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, accessToken, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch { return {}; }
}
