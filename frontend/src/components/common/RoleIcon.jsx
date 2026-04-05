import React from 'react';
import { Shield, ClipboardList, Star, User, HelpCircle } from 'lucide-react';

export const getRoleConfig = (role) => {
    switch (role) {
        case 'Super Admin':
            return {
                icon: Shield,
                color: 'text-red-500',
                bgColor: 'bg-red-500',
                borderColor: 'border-red-500',
                label: 'Super Admin',
                emoji: '🛡️'
            };
        case 'Project Manager':
            return {
                icon: ClipboardList,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500',
                borderColor: 'border-blue-500',
                label: 'Project Manager',
                emoji: '📋'
            };
        case 'Team Lead':
            return {
                icon: Star,
                color: 'text-yellow-500', // Gold-ish
                bgColor: 'bg-yellow-500',
                borderColor: 'border-yellow-500',
                label: 'Team Lead',
                emoji: '⭐'
            };
        case 'Team Member':
            return {
                icon: User,
                color: 'text-green-500',
                bgColor: 'bg-green-500',
                borderColor: 'border-green-500',
                label: 'Team Member',
                emoji: '👤'
            };
        default:
            return {
                icon: HelpCircle,
                color: 'text-dark-400',
                bgColor: 'bg-dark-400',
                borderColor: 'border-dark-400',
                label: role || 'User',
                emoji: '👤'
            };
    }
};

const RoleIcon = ({ role, size = 16, className = "" }) => {
    const config = getRoleConfig(role);
    const Icon = config.icon;

    if (!role) return null;

    return (
        <Icon
            size={size}
            className={`${config.color} ${className}`}
            title={`Role: ${config.label}`}
        />
    );
};

export default RoleIcon;
