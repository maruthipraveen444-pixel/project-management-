import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu, Mail, Calendar, X, Check, User, Settings, LogOut, ChevronDown, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';
import UserAvatar from '../common/UserAvatar';
import RoleIcon from '../common/RoleIcon';


const Header = ({ toggleSidebar, isMobile, onSearchClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/dashboard');
            if (data.success && data.data.notifications) {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'Meeting Scheduled': return 'bg-purple-500';
            case 'New Comment': return 'bg-blue-500';
            case 'Task Completed': return 'bg-green-500';
            case 'Leave Request': return 'bg-orange-500';
            case 'File Uploaded': return 'bg-cyan-500';
            default: return 'bg-primary-500';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const profileMenuItems = [
        { icon: User, label: 'My Profile', onClick: () => navigate('/settings') },
        { icon: FolderOpen, label: 'My Projects', onClick: () => navigate('/projects') },
        { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
        { divider: true },
        { icon: LogOut, label: 'Logout', onClick: handleLogout, danger: true }
    ];

    return (
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sticky top-0 z-30 transition-all duration-300">
            <div className="flex items-center gap-4">
                {isMobile && (
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-text-muted hover:text-text-main rounded-lg hover:bg-surface"
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Search Bar */}
                <div
                    className="hidden md:flex items-center relative cursor-text"
                    onClick={onSearchClick}
                >
                    <Search size={18} className="absolute left-3 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search projects, tasks..."
                        readOnly
                        className="bg-surface border-none rounded-lg py-2 pl-10 pr-4 text-sm text-text-main placeholder-text-muted w-64 focus:ring-2 focus:ring-primary-500/50 transition-all cursor-text pointer-events-none"
                    />

                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Date Display */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
                    <Calendar size={16} className="text-primary-400" />
                    <span className="text-sm font-medium text-text-main">
                        {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>

                {/* Notifications with Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                        className="relative p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                            <div className="flex justify-between items-center p-4 border-b border-border bg-surface">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-text-main">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                            <Check size={12} /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)} className="p-1 text-text-muted hover:text-text-main rounded">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell size={32} className="mx-auto text-dark-600 mb-2" />
                                        <p className="text-dark-400 text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif._id} className={`flex gap-3 p-4 hover:bg-dark-700/50 transition-colors cursor-pointer border-b border-dark-700/50 last:border-0 ${!notif.isRead ? 'bg-dark-750' : ''}`}>
                                            <div className="mt-1 shrink-0">
                                                <div className={`w-2.5 h-2.5 rounded-full ${getNotificationColor(notif.type)}`}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-medium text-white truncate">{notif.title}</h5>
                                                <p className="text-xs text-dark-400 line-clamp-2 mt-0.5">{notif.message}</p>
                                                <span className="text-[10px] text-dark-500 mt-1 block">
                                                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-border bg-surface">
                                    <button className="w-full text-center text-xs text-primary-400 hover:text-primary-300 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button className="relative p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors">
                    <Mail size={20} />
                </button>

                <div className="w-px h-8 bg-dark-700 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-surface p-1.5 rounded-lg transition-colors"
                    >
                        <UserAvatar user={user} size="sm" />
                        <div className="hidden md:block text-left">
                            <div className="flex items-center gap-1.5">
                                <RoleIcon role={user?.role} size={14} />
                                <p className="text-sm font-medium text-text-main">{user?.name}</p>
                            </div>
                            <p className="text-xs text-text-muted capitalize">{user?.role}</p>
                        </div>
                        <ChevronDown size={16} className={`text-text-muted hidden md:block transition-transform ${showProfile ? 'rotate-180' : ''}`} />
                    </button>


                    {/* Profile Dropdown Menu */}
                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                            {/* User Info Header */}
                            <div className="p-4 border-b border-border bg-surface">
                                <div className="flex items-center gap-2 mb-1">
                                    <RoleIcon role={user?.role} size={14} />
                                    <p className="text-sm font-medium text-text-main">{user?.name}</p>
                                </div>
                                <p className="text-xs text-text-muted">{user?.email}</p>
                            </div>


                            {/* Menu Items */}
                            <div className="py-2">
                                {profileMenuItems.map((item, index) => (
                                    item.divider ? (
                                        <div key={index} className="h-px bg-border my-2"></div>
                                    ) : (
                                        <button
                                            key={index}
                                            onClick={() => { item.onClick(); setShowProfile(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${item.danger
                                                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                                : 'text-text-muted hover:bg-surface hover:text-text-main'
                                                }`}
                                        >
                                            <item.icon size={16} />
                                            {item.label}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
