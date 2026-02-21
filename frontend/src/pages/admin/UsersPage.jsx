import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getUsers, updateLimit, updateStatus } from '../../api/admin';
import toast from 'react-hot-toast';
import { Loader2, ToggleLeft, ToggleRight, Edit3, Check, X } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editLimit, setEditLimit] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await getUsers();
            setUsers(data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.is_active;
        try {
            await updateStatus(user.id, newStatus);
            setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
            );
            toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleEditLimit = (user) => {
        setEditingId(user.id);
        setEditLimit(String(user.daily_limit));
    };

    const handleSaveLimit = async (userId) => {
        const val = parseInt(editLimit, 10);
        if (isNaN(val) || val < 0) { toast.error('Invalid limit'); return; }
        try {
            await updateLimit(userId, val);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, daily_limit: val } : u))
            );
            toast.success('Limit updated');
            setEditingId(null);
        } catch {
            toast.error('Failed to update limit');
        }
    };

    return (
        <Layout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage user access, status and daily limits</p>
                </div>

                <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-cyan-400" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Daily Limit</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm text-slate-500">#{user.id}</td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                                                    }`}>{user.role}</span>
                                            </td>

                                            {/* Editable Daily Limit */}
                                            <td className="px-6 py-4">
                                                {editingId === user.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={editLimit}
                                                            onChange={(e) => setEditLimit(e.target.value)}
                                                            className="w-24 bg-white/10 border border-cyan-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleSaveLimit(user.id)} className="text-green-400 hover:text-green-300 transition-colors">
                                                            <Check size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-300">{user.daily_limit?.toLocaleString()}</span>
                                                        <button
                                                            onClick={() => handleEditLimit(user)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-cyan-400 transition-all duration-200"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${user.is_active
                                                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Toggle Action */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${user.is_active
                                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                            : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                                        }`}
                                                >
                                                    {user.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
