import { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, Users, MessageSquare, Send,
    AlertCircle, CheckCircle, Loader, Edit3, Trash2,
    ChevronDown, User
} from 'lucide-react';
import api from '../utils/api';
import UserAvatar from './common/UserAvatar';
import RoleIcon from './common/RoleIcon';


// Generate gradient colors based on name
const getGradientColors = (name) => {
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#a18cd1', '#fbc2eb'],
        ['#ff9a9e', '#fecfef'],
        ['#667eea', '#764ba2']
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
};

// Get initials from name
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Priority badge classes
const getPriorityClass = (priority) => {
    const map = {
        'Critical': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'High': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Medium': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Low': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return map[priority] || map['Medium'];
};

// Status badge classes
const getStatusClass = (status) => {
    const map = {
        'Open': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        'To Do': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'In Review': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Blocked': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return map[status] || map['Open'];
};

const TaskDetailsDrawer = ({
    isOpen,
    onClose,
    task,
    onTaskUpdated,
    userRole,
    canEdit = true
}) => {
    const [loading, setLoading] = useState(false);
    const [taskData, setTaskData] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingField, setEditingField] = useState(null);

    // Check permissions
    const canEditTask = canEdit && ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(userRole);
    const canChangeStatus = canEdit; // All team members can change status

    useEffect(() => {
        if (isOpen && task) {
            fetchTaskDetails();
        }
    }, [isOpen, task?._id]);

    const fetchTaskDetails = async () => {
        if (!task?._id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/tasks/${task._id}`);
            if (data.success) {
                setTaskData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch task details', error);
            setTaskData(task); // Fallback to passed task data
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!canChangeStatus) return;
        try {
            await api.put(`/tasks/${task._id}`, { status: newStatus });
            setTaskData(prev => ({ ...prev, status: newStatus }));
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handlePriorityChange = async (newPriority) => {
        if (!canEditTask) return;
        try {
            await api.put(`/tasks/${task._id}`, { priority: newPriority });
            setTaskData(prev => ({ ...prev, priority: newPriority }));
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error('Failed to update priority', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            const { data } = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
            if (data.success) {
                setTaskData(prev => ({
                    ...prev,
                    comments: [...(prev.comments || []), data.data]
                }));
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const isOverdue = taskData?.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'Completed';

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-background border-l border-border z-50 shadow-2xl drawer-slide-in overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-border shrink-0">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded border ${getPriorityClass(taskData?.priority)}`}>
                                {taskData?.priority || 'Medium'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded border ${getStatusClass(taskData?.status)}`}>
                                {taskData?.status || 'Open'}
                            </span>
                            {isOverdue && (
                                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                    <AlertCircle size={12} /> Overdue
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {loading ? 'Loading...' : taskData?.title || task?.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader className="animate-spin text-primary-400" size={32} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {/* Description */}
                        <div className="p-6 border-b border-border">
                            <h3 className="text-sm font-semibold text-text-muted mb-2">Description</h3>
                            <p className="text-text-muted text-sm leading-relaxed">
                                {taskData?.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="p-6 border-b border-border grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <h3 className="text-xs font-semibold text-text-muted mb-2">Status</h3>
                                {canChangeStatus ? (
                                    <select
                                        value={taskData?.status || 'Open'}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="input-field text-sm py-2"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>
                                ) : (
                                    <span className={`text-xs px-2 py-1 rounded border ${getStatusClass(taskData?.status)}`}>
                                        {taskData?.status}
                                    </span>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <h3 className="text-xs font-semibold text-text-muted mb-2">Priority</h3>
                                {canEditTask ? (
                                    <select
                                        value={taskData?.priority || 'Medium'}
                                        onChange={(e) => handlePriorityChange(e.target.value)}
                                        className="input-field text-sm py-2"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                ) : (
                                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityClass(taskData?.priority)}`}>
                                        {taskData?.priority}
                                    </span>
                                )}
                            </div>

                            {/* Due Date */}
                            <div>
                                <h3 className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1">
                                    <Calendar size={12} /> Due Date
                                </h3>
                                <p className={`text-sm ${isOverdue ? 'text-red-400' : 'text-text-muted'}`}>
                                    {formatDate(taskData?.dueDate)}
                                </p>
                            </div>

                            {/* Time Tracking */}
                            <div>
                                <h3 className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1">
                                    <Clock size={12} /> Time
                                </h3>
                                <p className="text-sm text-text-muted">
                                    {taskData?.timeSpent || 0}h / {taskData?.estimatedHours || 0}h estimated
                                </p>
                            </div>
                        </div>

                        {/* Assigned Members */}
                        <div className="p-6 border-b border-border">
                            <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                                <Users size={14} /> Assigned Members
                            </h3>
                            {taskData?.assignedTo?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {taskData.assignedTo.map((user, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 bg-surface/50 px-3 py-2 rounded-lg"
                                        >
                                            <UserAvatar user={user} size="sm" />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-text-muted font-medium">{user.name}</span>
                                                <div className="flex items-center gap-1">
                                                    <RoleIcon role={user.role} size={10} />
                                                    <span className="text-[10px] text-text-muted capitalize">{user.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                <p className="text-text-muted text-sm">No members assigned</p>
                            )}
                        </div>

                        {/* Project Info */}
                        {taskData?.project && (
                            <div className="p-6 border-b border-border">
                                <h3 className="text-sm font-semibold text-text-muted mb-2">Project</h3>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: taskData.project.color || '#3b82f6' }}
                                    />
                                    <span className="text-sm text-text-muted">{taskData.project.name}</span>
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-2">
                                <MessageSquare size={14} /> Comments ({taskData?.comments?.length || 0})
                            </h3>

                            {/* Comments List */}
                            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                                {taskData?.comments?.length > 0 ? (
                                    taskData.comments.map((comment, i) => (
                                        <div key={i} className="flex gap-3">
                                            <UserAvatar user={comment.user} size="sm" showBadge={false} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <RoleIcon role={comment.user?.role} size={12} />
                                                        <span className="text-sm font-medium text-text-main">
                                                            {comment.user?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-text-muted">
                                                        {formatTimeAgo(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-muted">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-text-muted text-sm text-center py-4">No comments yet</p>
                                )}
                            </div>

                            {/* Add Comment */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Add a comment..."
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || submittingComment}
                                    className="btn-primary px-4 disabled:opacity-50"
                                >
                                    {submittingComment ? (
                                        <Loader className="animate-spin" size={18} />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TaskDetailsDrawer;
