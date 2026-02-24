import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
    getDailyAnalytics,
    getUserAnalytics,
    getModelAnalytics,
} from '../../api/admin';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[#13131f] border border-white/10 rounded-xl px-4 py-2 text-sm shadow-xl">
                {label && <p className="text-slate-400 mb-1">{label}</p>}
                <p className="text-white font-semibold">{payload[0].value?.toLocaleString()} tokens</p>
            </div>
        );
    }
    return null;
};

function ChartCard({ title, children, loading }) {
    return (
        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
                <h2 className="font-semibold text-white">{title}</h2>
            </div>
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 size={24} className="animate-spin text-cyan-400" />
                    </div>
                ) : children}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [daily, setDaily] = useState([]);
    const [users, setUsers] = useState([]);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getDailyAnalytics().then(({ data }) =>
                setDaily(data.map((d) => ({
                    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    tokens: d.total_tokens || 0,
                })))
            ),
            getUserAnalytics().then(({ data }) =>
                setUsers(data.map((d) => ({
                    email: d.email?.split('@')[0] || 'Unknown',
                    tokens: d.total_tokens || 0,
                })))
            ),
            getModelAnalytics().then(({ data }) =>
                setModels(data.map((d) => ({
                    name: d.model,
                    value: d._sum?.total_tokens || 0,
                })))
            ),
        ])
            .catch(() => toast.error('Failed to load analytics'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Token usage across users and models</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Daily Usage */}
                    <ChartCard title="Daily Token Usage" loading={loading}>
                        {daily.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-12">No data available yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={daily}>
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="tokens" fill="url(#cyan-grad)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* Per Model */}
                    <ChartCard title="Usage by Model" loading={loading}>
                        {models.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-12">No data available yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={models}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {models.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        formatter={(val) => <span className="text-xs text-slate-400">{val}</span>}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>

                {/* Per User */}
                <ChartCard title="Token Usage per User" loading={loading}>
                    {users.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-12">No data available yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={users} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="email" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar dataKey="tokens" fill="url(#purple-grad)" radius={[0, 6, 6, 0]} />
                                <defs>
                                    <linearGradient id="purple-grad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>
        </Layout>
    );
}
