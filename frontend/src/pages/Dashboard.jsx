import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getModels, generate, getUserStats } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const [stats, setStats] = useState({ used: 0, limit: 10000, remaining: 10000 });

    const fetchStats = () => {
        getUserStats()
            .then(({ data }) => setStats(data))
            .catch(() => { });
    };

    useEffect(() => {
        fetchStats();
        getModels()
            .then(({ data }) => {
                const sorted = data.sort();
                setModels(sorted);
                if (sorted.length > 0) setSelectedModel(sorted[0]);
            })
            .catch(() => toast.error('Failed to load models'));
    }, []);

    const remaining = Math.max(0, stats.limit - stats.used);
    const percentage = stats.limit > 0 ? Math.min(100, (stats.used / stats.limit) * 100).toFixed(1) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || !selectedModel) return;
        setLoading(true);
        setResponse(null);
        try {
            const { data } = await generate(selectedModel, prompt);
            setResponse(data.response || data.message || JSON.stringify(data));
            setPrompt('');
            toast.success('Generated successfully!');
            fetchStats(); // Refresh real usage from backend
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ padding: '2rem 3.5rem' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '1.5rem' }}>

                    <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2.8rem', fontWeight: 400, color: '#1a1a2e', lineHeight: 1.1 }}>
                        Dashboard
                    </h1>
                </div>

                {/* Top Stat Cards — 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Tokens Used', value: stats.used.toLocaleString(), color: '#1a1a2e' },
                        { label: 'Daily Limit', value: stats.limit.toLocaleString(), color: '#1a1a2e' },
                        { label: 'Remaining', value: remaining.toLocaleString(), color: '#10b981' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1.5px solid #e5e0d9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8a8070', marginBottom: '0.6rem' }}>
                                {label}
                            </p>
                            <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1 }}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Two-Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>

                    {/* Token Usage Card */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1.5px solid #e5e0d9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.2rem' }}>Token Usage</h2>
                                <p style={{ fontSize: '0.82rem', color: '#8a8070' }}>Today's consumption</p>
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                Active
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '8px', background: '#f0ebe3', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <div style={{ height: '100%', width: `${percentage}%`, background: '#10b981', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a8070', fontWeight: 500, marginBottom: '1.5rem' }}>
                            <span>{stats.used.toLocaleString()} used</span>
                            <span style={{ color: '#1a1a2e', fontWeight: 700 }}>{percentage}%</span>
                            <span>{stats.limit.toLocaleString()} limit</span>
                        </div>

                        {/* Summary Table */}
                        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #e5e0d9' }}>
                            {[
                                { label: 'Used Today', value: stats.used.toLocaleString(), color: '#1a1a2e', alt: true },
                                { label: 'Daily Limit', value: stats.limit.toLocaleString(), color: '#1a1a2e', alt: false },
                                { label: 'Remaining', value: remaining.toLocaleString(), color: '#10b981', alt: true },
                            ].map(({ label, value, color, alt }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: alt ? '#faf9f7' : '#fff', borderBottom: '1px solid #e5e0d9' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#8a8070' }}>{label}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Generation Card */}
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1.5px solid #e5e0d9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.2rem' }}>AI Generation</h2>
                        <p style={{ fontSize: '0.82rem', color: '#8a8070', marginBottom: '1.5rem' }}>Choose a model and enter your prompt</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8a8070', marginBottom: '0.5rem' }}>
                                    Model
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    style={{ width: '100%', background: '#faf9f7', border: '1.5px solid #e5e0d9', borderRadius: '8px', padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#1a1a2e', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    {models.length === 0 && <option>Loading models…</option>}
                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8a8070', marginBottom: '0.5rem' }}>
                                    Prompt
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Enter your prompt here..."
                                    rows={5}
                                    style={{ width: '100%', background: '#faf9f7', border: '1.5px solid #e5e0d9', borderRadius: '8px', padding: '0.8rem 1rem', fontSize: '0.9rem', color: '#1a1a2e', outline: 'none', resize: 'vertical', fontFamily: 'inherit', minHeight: '120px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !prompt.trim()}
                                style={{ width: '100%', background: loading || !prompt.trim() ? '#888' : '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                            >
                                {loading ? 'Generating…' : 'Generate →'}
                            </button>
                        </form>

                        {/* Response */}
                        {response && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1.5px solid #e5e0d9' }}>
                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8a8070', marginBottom: '0.6rem' }}>
                                    Response
                                </label>
                                <div style={{ background: '#faf9f7', border: '1.5px solid #e5e0d9', borderRadius: '8px', padding: '1rem', fontSize: '0.9rem', color: '#1a1a2e', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {response}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </Layout>
    );
}
