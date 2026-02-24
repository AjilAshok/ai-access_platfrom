import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout({ children }) {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f7f5f2] text-[#1a1a2e] flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="h-16 bg-[#1a1a2e] flex items-center justify-between px-8 shadow-sm">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#e8c07d] flex items-center justify-center text-[#1a1a2e] font-bold font-serif text-lg">
                        A
                    </div>
                    <span className="text-white font-serif text-xl tracking-wide">Ai Access Platfrom</span>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-6">
                    {isAdmin && (
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => isActive ? "text-white" : "text-white/60 hover:text-white"}
                            >
                            </NavLink>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#e8c07d] flex items-center justify-center text-[#1a1a2e] font-bold text-sm">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-white text-sm hidden sm:block">
                                {user?.email?.split('@')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-1.5 rounded bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors ml-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, width: '100%' }}>
                {children}
            </main>
        </div>
    );
}
