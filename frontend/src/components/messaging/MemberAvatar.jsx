/**
 * MemberAvatar - Reusable avatar component with role-based ring colors
 * Shows user's name initial with gradient background and role-colored ring
 */

const MemberAvatar = ({
    name,
    role,
    size = 'md',
    showOnline = true,
    className = ''
}) => {
    // Get first letter of name
    const initial = name?.charAt(0).toUpperCase() || '?';

    // Size variants
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-11 h-11 text-base',
        lg: 'w-14 h-14 text-xl',
        xl: 'w-20 h-20 text-2xl'
    };

    // Online dot sizes
    const dotSizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4'
    };

    // Generate unique gradient based on name
    const getAvatarGradient = (name) => {
        const gradients = [
            'from-rose-500 via-pink-500 to-fuchsia-500',
            'from-violet-500 via-purple-500 to-indigo-500',
            'from-blue-500 via-cyan-500 to-teal-500',
            'from-emerald-500 via-green-500 to-lime-500',
            'from-amber-500 via-orange-500 to-red-500',
            'from-pink-500 via-rose-500 to-red-500',
            'from-indigo-500 via-blue-500 to-cyan-500',
            'from-teal-500 via-emerald-500 to-green-500',
            'from-fuchsia-500 via-pink-500 to-rose-500',
            'from-cyan-500 via-sky-500 to-blue-500'
        ];
        const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        return gradients[hash % gradients.length];
    };

    // Role-based ring colors
    const getRoleRingColor = (role) => {
        const ringColors = {
            'Super Admin': 'ring-yellow-500 shadow-yellow-500/30',
            'Project Admin': 'ring-yellow-500 shadow-yellow-500/30',
            'Project Manager': 'ring-blue-500 shadow-blue-500/30',
            'Team Lead': 'ring-purple-500 shadow-purple-500/30',
            'Team Member': 'ring-green-500 shadow-green-500/30'
        };
        return ringColors[role] || 'ring-gray-500 shadow-gray-500/30';
    };

    return (
        <div className={`relative flex-shrink-0 ${className}`}>
            {/* Avatar Circle */}
            <div
                className={`
                    ${sizes[size]} 
                    rounded-full 
                    bg-gradient-to-br ${getAvatarGradient(name)}
                    flex items-center justify-center
                    ring-2 ${getRoleRingColor(role)}
                    shadow-lg
                    transition-transform duration-200 hover:scale-105
                `}
            >
                <span className="text-white font-bold drop-shadow-md select-none">
                    {initial}
                </span>
            </div>

            {/* Online Indicator Dot */}
            {showOnline && (
                <div
                    className={`
                        absolute -bottom-0.5 -right-0.5 
                        ${dotSizes[size]}
                        bg-green-500 
                        rounded-full 
                        border-2 border-background
                        shadow-sm
                    `}
                />
            )}
        </div>
    );
};

export default MemberAvatar;
