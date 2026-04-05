import React, { useState } from 'react';
import { getRoleConfig } from './RoleIcon';

// Generate consistent gradient based on name
const getGradient = (name) => {
    const gradients = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500',
        'from-pink-500 to-rose-500',
        'from-indigo-500 to-blue-600',
        'from-green-500 to-emerald-600',
        'from-red-500 to-orange-500'
    ];
    const index = (name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
};

// Get initials from name
const getInitials = (name) => {
    if (!name || name === 'undefined' || name === 'Unknown User') return '?';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = ({ user, size = 'md', showBadge = true, className = "", showTooltip = true }) => {
    const [showTip, setShowTip] = useState(false);
    const [imgError, setImgError] = useState(false);
    // Handle various user data structures and null/undefined gracefully
    // Sometimes user data comes as {user: {...}} instead of direct {...}
    const userData = user?.user || user;
    const userName = userData?.name || null;
    const userRole = userData?.role || 'Member';
    const userPhoto = userData?.photo;

    const config = getRoleConfig(userRole);
    const gradient = getGradient(userName || 'default');
    const initials = getInitials(userName);

    const sizeClasses = {
        xs: 'w-6 h-6 text-[8px]',
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-12 h-12 text-sm',
        xl: 'w-16 h-16 text-base'
    };

    const badgeSizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4'
    };

    const hasValidPhoto = userPhoto && !imgError && !userPhoto.includes('undefined');

    return (
        <div
            className={`relative inline-block rounded-full ${className}`}
            onMouseEnter={() => showTooltip && setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
        >
            <div
                className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-2 ${config.borderColor} overflow-hidden flex items-center justify-center font-bold text-white transition-transform hover:scale-110 cursor-pointer`}
            >
                {hasValidPhoto ? (
                    <img
                        src={userPhoto}
                        alt={userName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        {initials}
                    </div>
                )}
            </div>

            {showBadge && (
                <div className={`absolute -bottom-0.5 -right-0.5 ${badgeSizeClasses[size] || badgeSizeClasses.md} ${config.bgColor} rounded-full border-2 border-dark-900 shadow-lg`}></div>
            )}

            {/* Tooltip */}
            {showTip && showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 text-white text-[10px] rounded-lg whitespace-nowrap z-50 shadow-lg border border-dark-600 animate-fadeIn">
                    <div className="font-medium">{userName}</div>
                    <div className="text-dark-400 text-[9px]">{config.label}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-700 rotate-45 -mt-1 border-r border-b border-dark-600"></div>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
