import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Briefcase, Calendar,
    MessageSquare, FileText, Settings, LogOut,
    ChevronLeft, ChevronRight, X, Activity, Bug,
    Sun, Moon, Zap
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import RoleIcon from '../common/RoleIcon';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', accent: '#5b9cf6' },
        { icon: Briefcase,       label: 'Projects',  path: '/projects',  accent: '#a78bfa' },
        { icon: Calendar,        label: 'Tasks',     path: '/tasks',     accent: '#34d399' },
        ...(user?.role !== 'Team Member'
            ? [{ icon: Users, label: 'Team', path: '/team', accent: '#22d3ee' }]
            : []
        ),
        { icon: MessageSquare,   label: 'Messages',     path: '/messages', accent: '#a78bfa' },
        { icon: Bug,             label: 'Issues',       path: '/issues',   accent: '#fb7185' },
        { icon: FileText,        label: 'Reports',      path: '/reports',  accent: '#fbbf24' },
        { icon: Settings,        label: 'Settings',     path: '/settings', accent: '#94a3b8' },
        ...(user?.role === 'Super Admin' || user?.role === 'Project Manager'
            ? [{ icon: Activity, label: 'Activity Log', path: '/activity', accent: '#34d399' }]
            : []
        ),
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    style={{ background: 'rgba(3,6,15,0.75)', backdropFilter: 'blur(12px)' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-in-out
                  ${isOpen ? 'w-64' : 'w-[72px]'}
                  ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
                `}
                style={{
                    background: 'linear-gradient(180deg, rgba(7,12,28,0.88) 0%, rgba(3,6,15,0.92) 100%)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '6px 0 48px rgba(0,0,0,0.6)',
                }}
            >
                {/* ── Top bevel ── */}
                <div className="absolute top-0 left-0 right-0 h-px"
                     style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.35),rgba(167,139,250,0.3),transparent)' }} />

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 h-16 flex-shrink-0"
                     style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {/* Logo */}
                        <div className="w-9 h-9 rounded-[12px] flex-shrink-0 flex items-center justify-center relative"
                             style={{
                                 background: 'linear-gradient(135deg, #5b9cf6 0%, #a78bfa 100%)',
                                 border: '1px solid rgba(255,255,255,0.25)',
                                 boxShadow: '0 4px 20px rgba(91,156,246,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
                             }}>
                            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[12px]"
                                 style={{ background: 'rgba(255,255,255,0.25)' }} />
                            <Zap size={16} className="text-white relative z-10" fill="white" />
                        </div>
                        {isOpen && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm leading-tight text-gradient truncate whitespace-nowrap">
                                    ProjectOS
                                </p>
                                <p className="text-[10px] font-medium truncate"
                                   style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
                                    ENTERPRISE
                                </p>
                            </div>
                        )}
                    </div>

                    {!isMobile && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.45)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.15)'; e.currentTarget.style.color='#5b9cf6'; e.currentTarget.style.borderColor='rgba(91,156,246,0.35)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                        >
                            {isOpen ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
                        </button>
                    )}
                    {isMobile && (
                        <button onClick={() => setIsOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg"
                                style={{ color: 'rgba(255,255,255,0.45)' }}>
                            <X size={16}/>
                        </button>
                    )}
                </div>

                {/* ── User card ── */}
                {isOpen && (
                    <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-3 p-2.5 rounded-[14px] transition-all duration-200"
                             style={{
                                 background: 'rgba(255,255,255,0.04)',
                                 border: '1px solid rgba(255,255,255,0.07)',
                             }}
                             onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.07)'; e.currentTarget.style.borderColor='rgba(91,156,246,0.2)'; }}
                             onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
                        >
                            <UserAvatar user={user} size="md" />
                            <div className="overflow-hidden flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <RoleIcon role={user?.role} size={12} className="flex-shrink-0" />
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                </div>
                                <p className="text-[11px] truncate pl-5" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
                            </div>
                            {/* Online indicator */}
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                                 style={{ background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
                        </div>
                    </div>
                )}

                {/* ── Collapsed avatar ── */}
                {!isOpen && (
                    <div className="flex justify-center py-3 flex-shrink-0"
                         style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="relative">
                            <UserAvatar user={user} size="md" />
                            <div className="w-2. h-2 rounded-full absolute -bottom-0 -right-0"
                                 style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                        </div>
                    </div>
                )}

                {/* ── Navigation ── */}
                <nav className="flex-1 overflow-y-auto scrollbar-hide px-2.5 py-3 space-y-0.5">
                    {/* Section label */}
                    {isOpen && (
                        <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.12em]"
                           style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Navigation
                        </p>
                    )}

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={!isOpen ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all duration-200 group relative overflow-hidden
                                 ${isActive ? 'sidebar-link-active' : ''}`
                            }
                            style={({ isActive }) => isActive ? {} : {
                                color: 'rgba(255,255,255,0.45)',
                            }}
                            onMouseEnter={e => {
                                if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!e.currentTarget.classList.contains('sidebar-link-active')) {
                                    e.currentTarget.style.background = '';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={18} className="flex-shrink-0" />
                                    {isOpen && (
                                        <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                                    )}
                                    {/* Hover tooltip when collapsed */}
                                    {!isOpen && (
                                        <div className="absolute left-[68px] pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[9999] whitespace-nowrap"
                                             style={{
                                                 background: 'rgba(7,12,28,0.96)',
                                                 backdropFilter: 'blur(20px)',
                                                 border: '1px solid rgba(255,255,255,0.12)',
                                                 borderRadius: '10px',
                                                 padding: '6px 12px',
                                                 fontSize: '13px',
                                                 fontWeight: 500,
                                                 color: 'var(--text-primary)',
                                                 boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                             }}>
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* ── Footer ── */}
                <div className="flex-shrink-0 px-2.5 pb-3 pt-2 space-y-0.5"
                     style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] transition-all duration-200 ${!isOpen ? 'justify-center' : ''}`}
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark'
                            ? <Sun size={17} style={{ color: '#fbbf24' }} />
                            : <Moon size={17} style={{ color: '#93c5fd' }} />}
                        {isOpen && (
                            <span className="text-sm font-medium whitespace-nowrap">
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        )}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] transition-all duration-200 ${!isOpen ? 'justify-center' : ''}`}
                        style={{ color: 'rgba(251,113,133,0.75)' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(251,113,133,0.1)'; e.currentTarget.style.color='#fda4af'; }}
                        onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(251,113,133,0.75)'; }}
                    >
                        <LogOut size={17} className="flex-shrink-0" />
                        {isOpen && <span className="text-sm font-medium whitespace-nowrap">Sign out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
