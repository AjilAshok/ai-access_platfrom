import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getUsers, updateLimit, updateStatus, getDailyAnalytics, getUserAnalytics, getModelAnalytics } from '../../api/admin';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, Title, Tooltip, Legend, Filler
);


const s = {
    page: { padding: '2rem 4rem' },
    label: { fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0432a', marginBottom: '0.4rem' },
    heading: { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2.4rem', fontWeight: 400, color: '#1a1a2e', marginBottom: '1.75rem' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '1.75rem' },
    statCard: { background: '#fff', border: '1.5px solid #e5e0d9', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 5px rgba(0,0,0,0.04)' },
    statLabel: { fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#8a8070', marginBottom: '0.5rem' },
    statValue: { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 },
    statGreen: { color: '#10b981' },
    statAmber: { color: '#d97706' },
    statMeta: { fontSize: '0.75rem', color: '#8a8070', marginTop: '0.4rem' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
    tab: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
    tabActive: { background: '#1a1a2e', color: '#fff' },
    tabInactive: { background: '#ede8e0', color: '#8a8070' },
    card: { background: '#fff', border: '1.5px solid #e5e0d9', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 5px rgba(0,0,0,0.04)', marginBottom: '1.25rem' },
    searchRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
    search: { background: '#faf9f7', border: '1.5px solid #e5e0d9', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.88rem', color: '#1a1a2e', outline: 'none', width: '260px', fontFamily: 'inherit' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8070', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1.5px solid #e5e0d9', background: '#faf9f7' },
    td: { padding: '0.9rem 1rem', fontSize: '0.88rem', color: '#1a1a2e', borderBottom: '1px solid #f0ebe3', verticalAlign: 'middle' },
    badge: (active) => ({ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.7rem', borderRadius: '999px', background: active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: active ? '#10b981' : '#ef4444', border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }),
    roleBadge: (role) => ({ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '5px', background: role === 'admin' ? 'rgba(202,138,4,0.12)' : '#f0ebe3', color: role === 'admin' ? '#ca8a04' : '#8a8070', letterSpacing: '0.06em', textTransform: 'uppercase' }),
    btn: (variant) => {
        const v = { outline: { border: '1.5px solid #e5e0d9', background: '#fff', color: '#1a1a2e' }, danger: { border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444' }, success: { border: '1.5px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', color: '#10b981' } };
        return { ...{ padding: '0.3rem 0.75rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }, ...(v[variant] || v.outline) };
    },
    avatarCircle: (letter) => ({ width: '34px', height: '34px', borderRadius: '50%', background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    progressBar: (pct) => ({
        bar: { height: '6px', background: '#f0ebe3', borderRadius: '99px', width: '100px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle' },
        fill: { width: `${pct}%`, height: '100%', background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981', borderRadius: '99px' }
    }),
};

export default function AdminDashboard() {
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [search, setSearch] = useState('');
    const [editingLimit, setEditingLimit] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getUsers().then(({ data }) => setUsers(data)),
            getUserAnalytics().then(({ data }) => setUserStats(data)),
            getDailyAnalytics().then(({ data }) => setDailyData(data)),
            getModelAnalytics().then(({ data }) => setModelData(data)),
        ])
            .catch(() => toast.error('Failed to load admin data'))
            .finally(() => setLoading(false));
    }, []);

    const totalTokens = userStats.reduce((s, u) => s + (u.total_tokens || 0), 0);
    const activeCount = users.filter(u => u.is_active).length;
    const totalRequests = userStats.reduce((s, u) => s + (u.request_count || u.total_requests || 0), 0);

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggle = async (user) => {
        const newStatus = !user.is_active;
        try {
            await updateStatus(user.id, newStatus);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
            toast.success(`User ${newStatus ? 'enabled' : 'disabled'}`);
        } catch { toast.error('Failed to update status'); }
    };

    const handleSaveLimit = async (userId) => {
        const val = parseInt(editingLimit[userId]);
        if (isNaN(val) || val < 0) { toast.error('Invalid limit'); return; }
        try {
            await updateLimit(userId, val);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, daily_limit: val } : u));
            setEditingLimit(prev => { const n = { ...prev }; delete n[userId]; return n; });
            toast.success('Limit updated');
        } catch { toast.error('Failed to update limit'); }
    };

    const getUserUsedTokens = (userId) => {
        const s = userStats.find(u => u.userId === userId || u.user_id === userId);
        return s?.total_tokens || 0;
    };

    return (
        <Layout>
            <div style={s.page}>
                {/* Header */}
                <p style={s.label}>Control Center</p>
                <h1 style={s.heading}>Admin Portal</h1>

                {/* 4 Stat Cards */}
                <div style={s.statGrid}>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>Total Users</p>
                        <p style={s.statValue}>{users.length.toLocaleString()}</p>
                        <p style={s.statMeta}>All registered accounts</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>Active Users</p>
                        <p style={{ ...s.statValue, ...s.statGreen }}>{activeCount.toLocaleString()}</p>
                        <p style={s.statMeta}>{users.length ? ((activeCount / users.length) * 100).toFixed(1) : 0}% of total</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>Tokens Today</p>
                        <p style={{ ...s.statValue, ...s.statAmber }}>{totalTokens >= 1000000 ? (totalTokens / 1000000).toFixed(1) + 'M' : totalTokens.toLocaleString()}</p>
                        <p style={s.statMeta}>Across all models</p>
                    </div>
                    <div style={s.statCard}>
                        <p style={s.statLabel}>Requests Today</p>
                        <p style={s.statValue}>{totalRequests.toLocaleString()}</p>
                        <p style={s.statMeta}>Across all models</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={s.tabs}>
                    <button style={{ ...s.tab, ...(tab === 'users' ? s.tabActive : s.tabInactive) }} onClick={() => setTab('users')}>
                        👥 User Management
                    </button>
                    <button style={{ ...s.tab, ...(tab === 'analytics' ? s.tabActive : s.tabInactive) }} onClick={() => setTab('analytics')}>
                        📊 Analytics
                    </button>
                </div>

                {/* ── USER MANAGEMENT TAB ── */}
                {tab === 'users' && (
                    <div style={s.card}>
                        {/* Search + count */}
                        <div style={s.searchRow}>
                            <input
                                style={s.search}
                                placeholder="🔍  Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <span style={{ fontSize: '0.82rem', color: '#8a8070' }}>
                                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div style={s.tableWrap}>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        {['User', 'Role', 'Status', 'Daily Limit', 'Tokens Used', 'Actions'].map(h => (
                                            <th key={h} style={s.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const used = getUserUsedTokens(user.id);
                                        const pct = user.daily_limit ? Math.min(100, (used / user.daily_limit) * 100) : 0;
                                        const isEditing = editingLimit[user.id] !== undefined;
                                        const pb = s.progressBar(pct);
                                        return (
                                            <tr key={user.id} style={{ transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* User */}
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={s.avatarCircle()}>
                                                            {user.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.88rem' }}>{user.email.split('@')[0]}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#8a8070' }}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Role */}
                                                <td style={s.td}><span style={s.roleBadge(user.role)}>{user.role}</span></td>
                                                {/* Status */}
                                                <td style={s.td}>
                                                    <span style={s.badge(user.is_active)}>
                                                        <span style={{ fontSize: '0.6rem' }}>{user.is_active ? '●' : '○'}</span>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                {/* Daily Limit */}
                                                <td style={s.td}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                            <input
                                                                type="number"
                                                                value={editingLimit[user.id]}
                                                                onChange={e => setEditingLimit(p => ({ ...p, [user.id]: e.target.value }))}
                                                                style={{ ...s.search, width: '90px', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                                                            />
                                                            <button style={s.btn('success')} onClick={() => handleSaveLimit(user.id)}>Save</button>
                                                            <button style={s.btn('outline')} onClick={() => setEditingLimit(p => { const n = { ...p }; delete n[user.id]; return n; })}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{user.daily_limit?.toLocaleString()}</span>
                                                    )}
                                                </td>
                                                {/* Tokens Used */}
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span style={{ fontWeight: 600 }}>{used.toLocaleString()}</span>
                                                        <div style={pb.bar}><div style={pb.fill} /></div>
                                                        <span style={{ fontSize: '0.75rem', color: '#8a8070' }}>{pct.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                {/* Actions */}
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button
                                                            style={s.btn(user.is_active ? 'danger' : 'success')}
                                                            onClick={() => handleToggle(user)}
                                                        >
                                                            {user.is_active ? 'Disable' : 'Enable'}
                                                        </button>
                                                        <button
                                                            style={s.btn('outline')}
                                                            onClick={() => setEditingLimit(p => ({ ...p, [user.id]: user.daily_limit }))}
                                                        >
                                                            Edit Limit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8a8070', padding: '3rem' }}>No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ANALYTICS TAB ── */}
                {tab === 'analytics' && (
                    <>
                        {/* Sub-stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div style={s.statCard}>
                                <p style={s.statLabel}>Total Tokens</p>
                                <p style={s.statValue}>{totalTokens.toLocaleString()}</p>
                            </div>
                            <div style={s.statCard}>
                                <p style={s.statLabel}>Total Requests</p>
                                <p style={s.statValue}>{totalRequests.toLocaleString()}</p>
                            </div>
                            <div style={s.statCard}>
                                <p style={s.statLabel}>Avg Tokens / Req</p>
                                <p style={{ ...s.statValue, ...s.statAmber }}>{totalRequests ? Math.round(totalTokens / totalRequests).toLocaleString() : '—'}</p>
                            </div>
                        </div>

                        {/* Charts row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            {/* Daily Consumption — Line chart */}
                            <div style={s.card}>
                                <p style={{ ...s.statLabel, marginBottom: '0.2rem' }}>Token Usage</p>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.25rem' }}>Consumption Over Time</h3>
                                {dailyData.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#8a8070', padding: '3rem 0', fontSize: '0.9rem' }}>No data yet</div>
                                ) : (
                                    <Line
                                        data={{
                                            labels: dailyData.map(d => d.date),
                                            datasets: [{
                                                label: 'Tokens Used',
                                                data: dailyData.map(d => d.total_tokens),
                                                borderColor: '#1a1a2e',
                                                backgroundColor: 'rgba(26,26,46,0.08)',
                                                pointBackgroundColor: '#e8c07d',
                                                pointBorderColor: '#1a1a2e',
                                                pointRadius: 5,
                                                borderWidth: 2,
                                                tension: 0.4,
                                                fill: true,
                                            }],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#fff',
                                                    titleColor: '#1a1a2e',
                                                    bodyColor: '#8a8070',
                                                    borderColor: '#e5e0d9',
                                                    borderWidth: 1,
                                                    callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()} tokens` },
                                                },
                                            },
                                            scales: {
                                                x: { ticks: { color: '#8a8070', font: { size: 11 } }, grid: { color: '#f0ebe3' } },
                                                y: { ticks: { color: '#8a8070', font: { size: 11 } }, grid: { color: '#f0ebe3' } },
                                            },
                                        }}
                                        height={120}
                                    />
                                )}
                            </div>

                            {/* Model Breakdown — Bar chart */}
                            <div style={s.card}>
                                <p style={{ ...s.statLabel, marginBottom: '0.2rem' }}>Model Breakdown</p>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1.25rem' }}>Usage by Model</h3>
                                {modelData.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#8a8070', padding: '3rem 0', fontSize: '0.9rem' }}>No data yet</div>
                                ) : (
                                    <Bar
                                        data={{
                                            labels: modelData.map(d => d.model),
                                            datasets: [{
                                                label: 'Tokens',
                                                data: modelData.map(d => d.total_tokens),
                                                backgroundColor: '#1a1a2e',
                                                borderRadius: 6,
                                                borderSkipped: false,
                                                hoverBackgroundColor: '#e8c07d',
                                            }],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#fff',
                                                    titleColor: '#1a1a2e',
                                                    bodyColor: '#8a8070',
                                                    borderColor: '#e5e0d9',
                                                    borderWidth: 1,
                                                    callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()} tokens` },
                                                },
                                            },
                                            scales: {
                                                x: { ticks: { color: '#8a8070', font: { size: 11 } }, grid: { display: false } },
                                                y: { ticks: { color: '#8a8070', font: { size: 11 } }, grid: { color: '#f0ebe3' } },
                                            },
                                        }}
                                        height={120}
                                    />
                                )}
                            </div>
                        </div>


                        {/* Per-User Usage Table */}
                        <div style={{ ...s.card, marginTop: '1.25rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>Usage by User</h3>
                            <div style={s.tableWrap}>
                                <table style={s.table}>
                                    <thead>
                                        <tr>
                                            {['User', 'Total Tokens', 'Requests', 'Avg Tokens/Req'].map(h => (
                                                <th key={h} style={s.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userStats.map((u, i) => (
                                            <tr key={i}
                                                onMouseEnter={e => e.currentTarget.style.background = '#faf9f7'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {(u.email || u.userId || 'U')[0].toString().toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{u.email || `User #${u.userId || u.user_id}`}</span>
                                                    </div>
                                                </td>
                                                <td style={{ ...s.td, fontWeight: 700 }}>{(u.total_tokens || 0).toLocaleString()}</td>
                                                <td style={s.td}>{(u.request_count || u.total_requests || 0).toLocaleString()}</td>
                                                <td style={{ ...s.td, color: '#d97706', fontWeight: 700 }}>
                                                    {(u.request_count || u.total_requests) ? Math.round((u.total_tokens || 0) / (u.request_count || u.total_requests)) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                        {userStats.length === 0 && (
                                            <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#8a8070', padding: '2rem' }}>No analytics data yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
