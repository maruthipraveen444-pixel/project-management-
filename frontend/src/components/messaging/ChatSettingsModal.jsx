import { useState, useEffect } from 'react';
import { X, Settings, Trash2, UserMinus, UserPlus, Edit3, Save, Shield, Crown, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import AddMemberModal from './AddMemberModal';
import MemberAvatar from './MemberAvatar';

const ChatSettingsModal = ({ isOpen, onClose, conversation, currentUser, onUpdate, onDelete }) => {
    const [title, setTitle] = useState('');
    const [adminOnlyMessage, setAdminOnlyMessage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [removingUser, setRemovingUser] = useState(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Admin roles that can modify groups
    const ADMIN_ROLES = ['Super Admin', 'Project Admin'];

    // Check if current user is admin or chat creator
    const isAdmin = ADMIN_ROLES.includes(currentUser?.role);
    const isCreator = conversation?.createdBy?._id === currentUser?._id ||
        conversation?.createdBy === currentUser?._id;
    const canManage = isAdmin || isCreator;
    const canModifyMembers = isAdmin; // Only Admin/PM can add/remove members

    useEffect(() => {
        if (conversation) {
            setTitle(conversation.title || getDefaultTitle());
            setAdminOnlyMessage(conversation.adminOnlyMessage || false);
        }
    }, [conversation]);

    // Get default title from participant names
    const getDefaultTitle = () => {
        if (!conversation?.participants) return 'Chat';

        const others = conversation.participants.filter(
            p => p._id !== currentUser?._id
        );

        if (others.length === 1) return others[0]?.name || 'Chat';
        return others.map(p => p.name?.split(' ')[0]).join(', ');
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

    // Generate unique avatar gradient based on name
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

    // Save group settings
    const handleSave = async () => {
        if (!canManage) return;

        setSaving(true);
        try {
            const { data } = await api.put(`/messages/conversations/${conversation._id}/settings`, {
                title: title || null,
                adminOnlyMessage
            });

            if (data.success) {
                onUpdate?.(data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Remove member from group
    const handleRemoveMember = async (userId) => {
        if (!canModifyMembers || conversation.participants.length <= 2) return;

        if (!confirm('Are you sure you want to remove this member from the chat?')) return;

        setRemovingUser(userId);
        try {
            const { data } = await api.put(`/messages/conversations/${conversation._id}/remove-member`, {
                userId
            });

            if (data.success) {
                onUpdate?.(data.data);
            }
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert(error.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemovingUser(null);
        }
    };

    // Handle members added
    const handleMembersAdded = (updatedConversation) => {
        onUpdate?.(updatedConversation);
    };

    // Handle delete conversation
    const handleDeleteConversation = async () => {
        if (!confirm('Are you sure you want to delete this conversation and all its messages? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const { data } = await api.delete(`/messages/conversations/${conversation._id}`);

            if (data.success) {
                onDelete?.(conversation._id);
                onClose();
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            alert(error.response?.data?.message || 'Failed to delete conversation');
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen || !conversation) return null;

    const isGroupChat = conversation.participants?.length > 2;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-2xl shadow-2xl animate-fadeIn max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                                <Settings className="text-text-muted" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-text-main">Chat Settings</h2>
                                <p className="text-sm text-text-muted">
                                    {isGroupChat ? 'Group chat options' : 'Direct message options'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">

                        {/* Group Name (for group chats) */}
                        {isGroupChat && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-text-secondary">Group Name</label>
                                    {canManage && !isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                                        >
                                            <Edit3 size={12} />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter group name..."
                                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:border-primary-500/50"
                                        />
                                        <button
                                            onClick={() => {
                                                setTitle(conversation.title || getDefaultTitle());
                                                setIsEditing(false);
                                            }}
                                            className="px-3 py-2 bg-background hover:bg-surface-hover rounded-lg text-text-muted transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="px-3 py-2 bg-background/50 border border-border rounded-lg text-text-main">
                                        {title || getDefaultTitle()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Only Messaging */}
                        {canManage && (
                            <div className="p-4 bg-background/50 border border-border rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <Shield className="text-yellow-400" size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-text-main">Admin Only Messages</h4>
                                            <p className="text-xs text-text-muted">
                                                Only admins can send messages in this chat
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAdminOnlyMessage(!adminOnlyMessage)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${adminOnlyMessage ? 'bg-yellow-500' : 'bg-surface-hover'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${adminOnlyMessage ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {adminOnlyMessage && (
                                    <div className="flex items-start gap-2 p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                                        <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-yellow-400/80">
                                            Non-admin members can view messages but cannot reply.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Members Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-text-secondary">
                                    Members ({conversation.participants?.length || 0})
                                </label>

                                {/* Add Member Button - Only visible for Admin/PM */}
                                {canModifyMembers && (
                                    <button
                                        onClick={() => setShowAddMember(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 hover:text-primary-300 rounded-lg transition-all text-xs font-medium"
                                    >
                                        <UserPlus size={14} />
                                        Add Member
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {conversation.participants?.map((member) => {
                                    const isSelf = member._id === currentUser?._id;
                                    const isMemberCreator = member._id === (conversation.createdBy?._id || conversation.createdBy);
                                    const canRemove = canModifyMembers && !isSelf && !isMemberCreator && conversation.participants.length > 2;

                                    return (
                                        <div
                                            key={member._id}
                                            className="flex items-center gap-3 p-3 bg-background/30 hover:bg-surface-hover rounded-xl group transition-colors"
                                        >
                                            {/* Avatar with role-based ring color */}
                                            <MemberAvatar
                                                name={member.name}
                                                role={member.role}
                                                size="md"
                                                showOnline={true}
                                            />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-text-main truncate">
                                                        {member.name}
                                                        {isSelf && <span className="text-text-muted font-normal"> (you)</span>}
                                                    </h4>
                                                    {isMemberCreator && (
                                                        <Crown size={14} className="text-yellow-400 flex-shrink-0" title="Chat Creator" />
                                                    )}
                                                </div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(member.role)}`}>
                                                    {member.role}
                                                </span>
                                            </div>

                                            {/* Remove Button */}
                                            {canRemove && (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    disabled={removingUser === member._id}
                                                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all disabled:opacity-50"
                                                    title="Remove from chat"
                                                >
                                                    {removingUser === member._id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <UserMinus size={16} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        {canManage && (
                            <div className="pt-4 border-t border-border">
                                <p className="text-xs text-text-muted mb-3">Danger Zone</p>
                                <button
                                    onClick={handleDeleteConversation}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete Conversation
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {canManage && (
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-border flex-shrink-0">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-all text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-hover disabled:cursor-not-allowed text-white rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary-500/20 disabled:shadow-none"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                conversationId={conversation?._id}
                onMembersAdded={handleMembersAdded}
            />
        </>
    );
};

export default ChatSettingsModal;
