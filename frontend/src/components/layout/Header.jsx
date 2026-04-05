import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Bell, Search, Menu, Calendar, X, Check,
    User, Settings, LogOut, ChevronDown, FolderOpen, Sparkles
} from 'lucide-react';
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        try { await api.put('/notifications/mark-read'); } catch(_) {}
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getNotificationColor = (type) => ({
        'Meeting Scheduled': '#a78bfa',
        'New Comment':       '#5b9cf6',
        'Task Completed':    '#34d399',
        'Leave Request':     '#fb923c',
        'File Uploaded':     '#22d3ee',
    }[type] ?? '#5b9cf6');

    const profileMenuItems = [
        { icon: User,       label: 'My Profile',  onClick: () => navigate('/settings') },
        { icon: FolderOpen, label: 'My Projects', onClick: () => navigate('/projects') },
        { icon: Settings,   label: 'Settings',    onClick: () => navigate('/settings') },
        { divider: true },
        { icon: LogOut, label: 'Sign out', onClick: handleLogout, danger: true },
    ];

    /* ── Style tokens ── */
    const headerBg = {
        background: 'rgba(3,6,15,0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.45)',
    };

    const iconBtn = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '8px',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
    };

    const popup = {
        background: 'rgba(7,12,28,0.96)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.11)',
        borderRadius: '18px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.14)',
    };

    return (
        <header style={headerBg} className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            {/* Top bevel */}
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.3),rgba(167,139,250,0.25),transparent)' }} />

            {/* ── Left ── */}
            <div className="flex items-center gap-3">
                {isMobile && (
                    <button style={iconBtn} onClick={toggleSidebar}
                            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(91,156,246,0.14)'; e.currentTarget.style.color='#5b9cf6'; e.currentTarget.style.borderColor='rgba(91,156,246,0.3)'; }}
                            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
                        <Menu size={19}/>
                    </button>
                )}

                {/* Search */}
                <div className="hidden md:flex items-center gap-2 cursor-text relative group" onClick={onSearchClick}>
                    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-[12px] transition-all duration-200 w-64"
                         style={{
                             background: 'rgba(255,255,255,0.05)',
                             border: '1px solid rgba(255,255,255,0.08)',
                         }}
                         onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(91,156,246,0.35)'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                         onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
                    >
                        <Search size={15} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Search…</span>
                        <div className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                             style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            ⌃/
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right ── */}
            <div className="flex items-center gap-2">

                {/* Date chip */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Calendar size={13} style={{ color: '#5b9cf6' }} />
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {new Date().toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                </div>

                {/* ── Notification bell ── */}
                <div className="relative" ref={notificationRef}>
                    <button
                        style={iconBtn}
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(91,156,246,0.14)'; e.currentTarget.style.color='#5b9cf6'; e.currentTarget.style.borderColor='rgba(91,156,246,0.3)'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                    >
                        <Bell size={18}/>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1"
                                  style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)', boxShadow: '0 0 12px rgba(251,113,133,0.7)', border: '1.5px solid rgba(3,6,15,0.9)' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 overflow-hidden z-50 animate-fadeInScale"
                             style={popup}>
                            <div className="absolute top-0 left-0 right-0 h-px"
                                 style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.4),rgba(167,139,250,0.35),transparent)' }} />

                            <div className="flex justify-between items-center px-5 py-4"
                                 style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-full font-semibold"
                                              style={{ background: 'rgba(91,156,246,0.18)', color: '#93c5fd', border: '1px solid rgba(91,156,246,0.3)' }}>
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead}
                                                className="text-[11px] flex items-center gap-1 font-medium px-2 py-1 rounded-lg transition-colors"
                                                style={{ color: '#5b9cf6', background: 'rgba(91,156,246,0.08)' }}
                                                onMouseEnter={e=>e.currentTarget.style.background='rgba(91,156,246,0.16)'}
                                                onMouseLeave={e=>e.currentTarget.style.background='rgba(91,156,246,0.08)'}>
                                            <Check size={11}/> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                            style={{ color: 'rgba(255,255,255,0.4)' }}
                                            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                                            onMouseLeave={e=>{ e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}>
                                        <X size={14}/>
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
                                             style={{ borderColor: 'rgba(91,156,246,0.3)', borderTopColor: '#5b9cf6' }}/>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <Bell size={22} style={{ color: 'rgba(255,255,255,0.25)' }}/>
                                        </div>
                                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>All caught up!</p>
                                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif._id}
                                             className="flex gap-3 px-5 py-3.5 cursor-pointer transition-all"
                                             style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: !notif.isRead ? 'rgba(91,156,246,0.04)' : 'transparent' }}
                                             onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                                             onMouseLeave={e => e.currentTarget.style.background = !notif.isRead ? 'rgba(91,156,246,0.04)' : 'transparent'}>
                                            <div className="mt-1.5 shrink-0">
                                                <div className="w-2.5 h-2.5 rounded-full"
                                                     style={{ background: getNotificationColor(notif.type), boxShadow: `0 0 10px ${getNotificationColor(notif.type)}99` }}/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                                                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
                                                <span className="text-[10px] mt-1 block" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                                     style={{ background: '#5b9cf6', boxShadow: '0 0 6px rgba(91,156,246,0.8)' }}/>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    <button 
                                            onClick={() => { setShowNotifications(false); navigate('/settings'); }}
                                            className="w-full text-center text-xs font-semibold transition-colors py-1"
                                            style={{ color: '#5b9cf6' }}
                                            onMouseEnter={e=>e.currentTarget.style.color='#93c5fd'}
                                            onMouseLeave={e=>e.currentTarget.style.color='#5b9cf6'}>
                                        View all notifications →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-7 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }}/>

                {/* ── Profile ── */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-[14px] transition-all duration-200"
                        style={{
                            background: showProfile ? 'rgba(91,156,246,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${showProfile ? 'rgba(91,156,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.08)'; e.currentTarget.style.borderColor='rgba(91,156,246,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background=showProfile?'rgba(91,156,246,0.1)':'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor=showProfile?'rgba(91,156,246,0.3)':'rgba(255,255,255,0.08)'; }}
                    >
                        <UserAvatar user={user} size="sm"/>
                        <div className="hidden md:block text-left">
                            <div className="flex items-center gap-1.5">
                                <RoleIcon role={user?.role} size={12}/>
                                <p className="text-sm font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            </div>
                            <p className="text-[11px] mt-0.5 capitalize" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
                        </div>
                        <ChevronDown size={14} className={`hidden md:block transition-transform duration-200 ${showProfile?'rotate-180':''}`}
                                     style={{ color: 'rgba(255,255,255,0.4)' }}/>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2.5 w-60 overflow-hidden z-50 animate-fadeInScale"
                             style={popup}>
                            <div className="absolute top-0 left-0 right-0 h-px"
                                 style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.4),rgba(167,139,250,0.35),transparent)' }}/>

                            {/* User banner */}
                            <div className="p-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} size="md"/>
                                    <div className="overflow-hidden flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <RoleIcon role={user?.role} size={12}/>
                                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                        </div>
                                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                    </div>
                                </div>
                                {/* Status indicator */}
                                <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                                     style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}/>
                                    <span className="text-[11px] font-medium" style={{ color: '#34d399' }}>Online · Active</span>
                                </div>
                            </div>

                            <div className="py-2 px-1.5">
                                {profileMenuItems.map((item, index) =>
                                    item.divider ? (
                                        <div key={index} className="my-1 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.07)' }}/>
                                    ) : (
                                        <button
                                            key={index}
                                            onClick={() => { item.onClick(); setShowProfile(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-150"
                                            style={{ color: item.danger ? 'rgba(251,113,133,0.8)' : 'rgba(255,255,255,0.6)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = item.danger ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = item.danger ? '#fda4af' : 'rgba(255,255,255,0.95)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color = item.danger ? 'rgba(251,113,133,0.8)' : 'rgba(255,255,255,0.6)'; }}
                                        >
                                            <item.icon size={15}/>
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
