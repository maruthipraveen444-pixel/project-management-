import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    MessageSquare,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Activity,
    Bug,
    Sun,
    Moon
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';
import RoleIcon from '../common/RoleIcon';
import { useTheme } from '../../context/ThemeContext';


const Sidebar = ({ isOpen, setIsOpen, isMobile, setIsMobile }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Base nav items for all users
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Projects', path: '/projects' },
        { icon: Calendar, label: 'Tasks', path: '/tasks' },
        ...(user?.role !== 'Team Member'
            ? [{ icon: Users, label: 'Team', path: '/team' }]
            : []
        ),
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Bug, label: 'Issues', path: '/issues' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        // Activity Log - visible only to Super Admin and Project Manager
        ...(user?.role === 'Super Admin' || user?.role === 'Project Manager'
            ? [{ icon: Activity, label: 'Activity Log', path: '/activity' }]
            : []
        ),
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen bg-background border-r border-border transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                            <LayoutDashboard size={18} className="text-white" />
                        </div>
                        <span className={`font-bold text-sm text-text-main transition-opacity duration-200 leading-tight ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            Project Management System
                        </span>
                    </div>
                    {!isMobile && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1.5 rounded-lg bg-surface text-text-muted hover:text-text-main hover:bg-background transition-colors"
                        >
                            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                    )}
                    {isMobile && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-main"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* User Profile Snippet */}
                <div className={`p-4 border-b border-border transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
                    <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <RoleIcon role={user?.role} size={14} className="flex-shrink-0" />
                                <h4 className="text-sm font-semibold text-text-main truncate">{user?.name}</h4>
                            </div>
                            <p className="text-xs text-text-muted truncate pl-5">{user?.role}</p>
                        </div>
                    </div>
                </div>


                {/* Navigation */}
                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)] scrollbar-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                    : 'text-text-muted hover:bg-surface hover:text-text-main'
                                }
              `}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                                {item.label}
                            </span>
                            {/* Tooltip for collapsed state */}
                            {!isOpen && !isMobile && (
                                <div className="absolute left-16 bg-surface text-text-main text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap border border-border">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-surface">
                    <button
                        onClick={toggleTheme}
                        className={`
                            flex items-center justify-center w-full px-3 py-3 rounded-lg 
                            text-text-muted hover:bg-background hover:text-text-main 
                            transition-all duration-200 group mb-2
                        `}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group
              ${!isOpen && 'justify-center'}
            `}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className={`font-medium whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                            Logout
                        </span>
                        {!isOpen && !isMobile && (
                            <div className="absolute left-16 bg-surface text-text-main text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-border">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
