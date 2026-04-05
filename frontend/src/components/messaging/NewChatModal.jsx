import { useState, useEffect } from 'react';
import { X, Search, MessageSquarePlus, Users, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import UserAvatar from '../common/UserAvatar';

const NewChatModal = ({ isOpen, onClose, onStartChat, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [starting, setStarting] = useState(false);

    // Fetch available users
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/messages/users');
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter users by search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggle user selection
    const toggleUser = (user) => {
        if (selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    // Start chat
    const handleStartChat = async () => {
        if (selectedUsers.length === 0) return;

        try {
            setStarting(true);
            const participantIds = selectedUsers.map(u => u._id);
            await onStartChat(participantIds);

            // Reset and close
            setSelectedUsers([]);
            setSearchQuery('');
            onClose();
        } catch (error) {
            console.error('Failed to start chat:', error);
        } finally {
            setStarting(false);
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        const colors = {
            'Super Admin': 'bg-red-500/10 text-red-400 border-red-500/20',
            'Project Admin': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'Project Manager': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Team Lead': 'bg-green-500/10 text-green-400 border-green-500/20',
            'Team Member': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
        return colors[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-2xl shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <MessageSquarePlus className="text-primary-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-main">New Conversation</h2>
                            <p className="text-sm text-text-muted">Select users to start chatting</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or role..."
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="px-4 py-3 border-b border-border">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full"
                                >
                                    <span className="text-sm text-primary-400">{user.name}</span>
                                    <button
                                        onClick={() => toggleUser(user)}
                                        className="w-4 h-4 rounded-full bg-primary-500/20 hover:bg-primary-500/40 flex items-center justify-center transition-colors"
                                    >
                                        <X size={12} className="text-primary-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* User List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="text-text-muted mb-3" size={40} />
                            <p className="text-text-muted">
                                {searchQuery ? 'No users found' : 'No users available'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map(user => {
                                const isSelected = selectedUsers.find(u => u._id === user._id);

                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                            ${isSelected
                                                ? 'bg-primary-500/10 border border-primary-500/30'
                                                : 'hover:bg-surface-hover border border-transparent'
                                            }
                                        `}
                                    >
                                        {/* Avatar */}
                                        <UserAvatar user={user} size="md" />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-text-main truncate">{user.name}</h4>
                                            <p className="text-sm text-text-muted truncate">{user.email}</p>
                                        </div>

                                        {/* Role Badge */}
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>

                                        {/* Checkbox */}
                                        <div className={`
                                            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                            ${isSelected
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-text-muted/50 hover:border-text-muted'
                                            }
                                        `}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-all text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartChat}
                        disabled={selectedUsers.length === 0 || starting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-hover disabled:cursor-not-allowed text-white rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary-500/20 disabled:shadow-none"
                    >
                        {starting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <MessageSquarePlus size={18} />
                                Start Chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
