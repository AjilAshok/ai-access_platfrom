import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success('Welcome back!');
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Brand */}
                <p className="auth-brand">AI ACCESS PLATFORM</p>
                <h1 className="auth-heading">Welcome back</h1>
                <p className="auth-sub">Sign in to continue your journey.</p>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button className="auth-tab auth-tab--active">Sign In</button>
                    <button
                        className="auth-tab"
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">EMAIL ADDRESS</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="auth-input"
                        />
                      
                    </div>

                    <button type="submit" disabled={loading} className="auth-submit">
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
