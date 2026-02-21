import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import toast from 'react-hot-toast';

function getStrength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 3); // 1..3
}

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const strength = getStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await registerApi(email, password);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Brand */}
                <p className="auth-brand">AI ACCESS PLATFORM</p>
                <h1 className="auth-heading">Create account</h1>
                <p className="auth-sub">Start your journey with us today.</p>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button className="auth-tab" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="auth-tab auth-tab--active">Register</button>
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
                            placeholder="Create a strong password"
                            className="auth-input"
                        />
                        {/* Strength bars */}
                        {password && (
                            <div className="auth-strength">
                                <div className={`auth-strength-bar ${strength >= 1 ? 'auth-strength-bar--filled strength-' + strength : ''}`} />
                                <div className={`auth-strength-bar ${strength >= 2 ? 'auth-strength-bar--filled strength-' + strength : ''}`} />
                                <div className={`auth-strength-bar ${strength >= 3 ? 'auth-strength-bar--filled strength-' + strength : ''}`} />
                            </div>
                        )}
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            placeholder="Repeat your password"
                            className="auth-input"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="auth-submit">
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>
                </form>

                <p className="auth-terms">
                    By registering, you agree to our{' '}
                    <a href="#" className="auth-terms-link">Terms of Service</a>{' '}and{' '}
                    <a href="#" className="auth-terms-link">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
