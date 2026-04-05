import { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, Loader2, Check, Users } from 'lucide-react';
import api from '../../utils/api';
import MemberAvatar from './MemberAvatar';

// Role badge styling
const getRoleBadgeStyle = (role) => {
    switch (role) {
        case 'Super Admin':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'Project Admin':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'Team Lead':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'Team Member':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const AddMemberModal = ({ isOpen, onClose, conversationId, onMembersAdded }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    // Fetch available users
    const fetchAvailableUsers = useCallback(async (search = '') => {
        if (!conversationId) return;

        try {
            setSearching(true);
            const { data } = await api.get(
                `/messages/conversations/${conversationId}/available-users`,
                { params: { search } }
            );
            if (data.success) {
                setAvailableUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch available users:', error);
            setError('Failed to load users');
        } finally {
            setSearching(false);
        }
    }, [conversationId]);

    // Initial fetch when modal opens
    useEffect(() => {
        if (isOpen && conversationId) {
            fetchAvailableUsers();
            setSelectedUsers([]);
            setSearchQuery('');
            setError('');
        }
    }, [isOpen, conversationId, fetchAvailableUsers]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            fetchAvailableUsers(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen, fetchAvailableUsers]);

    // Toggle user selection
    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Handle add members
    const handleAddMembers = async () => {
        if (selectedUsers.length === 0) return;

        try {
            setLoading(true);
            setError('');
            const { data } = await api.post(
                `/messages/conversations/${conversationId}/add-members`,
                { members: selectedUsers }
            );

            if (data.success) {
                onMembersAdded(data.data);
                onClose();
            }
        } catch (error) {
            console.error('Failed to add members:', error);
            setError(error.response?.data?.message || 'Failed to add members');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <UserPlus size={20} className="text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-main">Add Members</h2>
                            <p className="text-xs text-text-muted">Select users to add to the group</p>
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
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                        />
                        {searching && (
                            <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* User List */}
                <div className="max-h-72 overflow-y-auto p-2">
                    {availableUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users size={40} className="text-text-muted mb-3" />
                            <p className="text-text-muted text-sm">
                                {searchQuery ? 'No users found matching your search' : 'No users available to add'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {availableUsers.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUserSelection(user._id)}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                        ${selectedUsers.includes(user._id)
                                            ? 'bg-primary-500/10 border border-primary-500/30'
                                            : 'hover:bg-surface-hover border border-transparent'
                                        }
                                    `}
                                >
                                    {/* Checkbox */}
                                    <div className={`
                                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                        ${selectedUsers.includes(user._id)
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'border-text-muted/50 hover:border-text-muted'
                                        }
                                    `}>
                                        {selectedUsers.includes(user._id) && (
                                            <Check size={12} className="text-white" />
                                        )}
                                    </div>

                                    {/* Avatar with MemberAvatar */}
                                    <MemberAvatar
                                        name={user.name}
                                        role={user.role}
                                        size="md"
                                        showOnline={false}
                                    />

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-text-main truncate">{user.name}</p>
                                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                                    </div>

                                    {/* Role Badge */}
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Count & Actions */}
                <div className="flex items-center justify-between p-4 border-t border-border bg-background/50">
                    <p className="text-sm text-text-muted">
                        {selectedUsers.length > 0
                            ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`
                            : 'Select users to add'
                        }
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddMembers}
                            disabled={selectedUsers.length === 0 || loading}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                ${selectedUsers.length > 0 && !loading
                                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-surface-hover text-text-muted cursor-not-allowed'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    Add Members
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;
