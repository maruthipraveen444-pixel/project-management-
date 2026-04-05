import { useEffect, useRef } from 'react';
import {
    Info,
    Reply,
    Copy,
    Forward,
    Pin,
    Star,
    Pencil,
    CheckSquare,
    Trash2
} from 'lucide-react';

const MessageContextMenu = ({
    isOpen,
    position,
    message,
    currentUser,
    onClose,
    onReply,
    onCopy,
    onForward,
    onPin,
    onStar,
    onEdit,
    onSelect,
    onDelete,
    onInfo
}) => {
    const menuRef = useRef(null);

    // Admin roles
    const ADMIN_ROLES = ['Super Admin', 'Project Admin'];

    // Check permissions
    const isSender = message?.senderId?._id === currentUser?._id ||
        message?.senderId === currentUser?._id;
    const isAdmin = ADMIN_ROLES.includes(currentUser?.role);
    const canEdit = isSender;
    const canDelete = isSender || isAdmin;
    const isStarred = message?.isStarredBy?.includes(currentUser?._id);
    const isPinned = message?.isPinned;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !message) return null;

    // Calculate menu position
    const menuStyle = {
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1000,
    };

    // Adjust position if menu would go off screen
    if (typeof window !== 'undefined') {
        const menuWidth = 200;
        const menuHeight = 360;

        if (position.x + menuWidth > window.innerWidth) {
            menuStyle.left = position.x - menuWidth;
        }
        if (position.y + menuHeight > window.innerHeight) {
            menuStyle.top = window.innerHeight - menuHeight - 10;
        }
    }

    const menuItems = [
        {
            icon: Info,
            label: 'Message info',
            onClick: () => { onInfo?.(message); onClose(); },
            show: true,
            disabled: false
        },
        {
            icon: Reply,
            label: 'Reply',
            onClick: () => { onReply?.(message); onClose(); },
            show: true,
            disabled: false
        },
        {
            icon: Copy,
            label: 'Copy',
            onClick: () => { onCopy?.(message); onClose(); },
            show: true,
            disabled: false
        },
        {
            icon: Forward,
            label: 'Forward',
            onClick: () => { onForward?.(message); onClose(); },
            show: true,
            disabled: false
        },
        {
            icon: Pin,
            label: isPinned ? 'Unpin' : 'Pin',
            onClick: () => { onPin?.(message); onClose(); },
            show: true,
            disabled: false,
            active: isPinned
        },
        {
            icon: Star,
            label: isStarred ? 'Unstar' : 'Star',
            onClick: () => { onStar?.(message); onClose(); },
            show: true,
            disabled: false,
            active: isStarred
        },
        {
            icon: Pencil,
            label: 'Edit',
            onClick: () => { onEdit?.(message); onClose(); },
            show: true,
            disabled: !canEdit
        },
        {
            icon: CheckSquare,
            label: 'Select',
            onClick: () => { onSelect?.(message); onClose(); },
            show: true,
            disabled: false
        },
        {
            icon: Trash2,
            label: 'Delete',
            onClick: () => { onDelete?.(message); onClose(); },
            show: true,
            disabled: !canDelete,
            danger: true
        }
    ];

    return (
        <div
            ref={menuRef}
            style={menuStyle}
            className="min-w-[180px] bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
            <div className="py-2">
                {menuItems.filter(item => item.show).map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`
                                w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                ${item.disabled
                                    ? 'text-text-muted/50 cursor-not-allowed'
                                    : item.danger
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : item.active
                                            ? 'text-primary-400 hover:bg-primary-500/10'
                                            : 'text-text-main hover:bg-surface-hover'
                                }
                            `}
                        >
                            <Icon size={18} className={item.disabled ? 'opacity-40' : ''} />
                            <span className={`text-sm ${item.disabled ? 'opacity-40' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MessageContextMenu;
