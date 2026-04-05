import { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Filter, MessageSquare, Clock, Calendar,
    MoreVertical, Edit3, Trash2, UserPlus, AlertCircle,
    ChevronDown, X, GripVertical
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import UserAvatar from '../components/common/UserAvatar';
import RoleIcon from '../components/common/RoleIcon';


// Column configuration
const columns = [
    { id: 'Open', title: 'Open', color: 'bg-gray-500', borderColor: 'border-gray-500' },
    { id: 'To Do', title: 'To Do', color: 'bg-blue-500', borderColor: 'border-blue-500' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-yellow-500', borderColor: 'border-yellow-500' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-500', borderColor: 'border-green-500' }
];

// Priority colors
const getPriorityClass = (priority) => {
    const map = {
        'Critical': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'High': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Medium': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Low': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return map[priority] || map['Medium'];
};

// Generate gradient colors based on name
const getGradientColors = (name) => {
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#a18cd1', '#fbc2eb']
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
};

// Get initials
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Task Card Component
const TaskCard = ({
    task,
    onDragStart,
    onDragEnd,
    onClick,
    onEdit,
    onDelete,
    onAssign,
    canEdit,
    isDragging
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, task)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(task)}
            className={`
                bg-card border border-card p-4 rounded-xl cursor-pointer group
                hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/5
                transition-all duration-200 relative
                ${isDragging ? 'opacity-50 scale-95' : 'hover:-translate-y-0.5'}
            `}
        >
            {/* Drag Handle */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted">
                <GripVertical size={14} />
            </div>

            {/* Top Row */}
            <div className="flex justify-between items-start mb-2 pl-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getPriorityClass(task.priority)}`}>
                        {task.priority || 'Medium'}
                    </span>
                    {isOverdue && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <AlertCircle size={10} /> Overdue
                        </span>
                    )}
                </div>

                {/* Menu Button */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-main p-1 rounded hover:bg-surface transition-all"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-8 bg-surface rounded-lg border border-border shadow-xl z-20 py-1 min-w-[140px]">
                                {canEdit && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(task); setShowMenu(false); }}
                                            className="w-full px-3 py-2 text-left text-sm text-text-main hover:bg-surface-hover flex items-center gap-2"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onAssign(task); setShowMenu(false); }}
                                            className="w-full px-3 py-2 text-left text-sm text-text-main hover:bg-surface-hover flex items-center gap-2"
                                        >
                                            <UserPlus size={14} /> Assign
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(task); setShowMenu(false); }}
                                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-surface-hover flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Title & Description */}
            <div className="pl-3">
                <h4 className="text-sm font-semibold text-text-main mb-1 line-clamp-2">{task.title}</h4>
                {task.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2">{task.description}</p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border pl-3">
                <div className="flex items-center gap-3 text-text-muted text-xs">
                    {task.comments?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            <span>{task.comments.length}</span>
                        </div>
                    )}
                    {task.estimatedHours > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{task.timeSpent || 0}/{task.estimatedHours}h</span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                            <Calendar size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>

                {/* Assigned Users */}
                <div className="flex -space-x-2">
                    {task.assignedTo?.slice(0, 3).map((user, i) => (
                        <UserAvatar
                            key={i}
                            user={user}
                            size="xs"
                            showBadge={false}
                            className="ring-2 ring-dark-900"
                        />
                    ))}
                    {task.assignedTo?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-surface border-2 border-card flex items-center justify-center text-[10px] text-text-muted font-bold z-10">
                            +{task.assignedTo.length - 3}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// Filter Toolbar Component
const FilterToolbar = ({
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    teamMembers,
    onClearFilters
}) => {
    const hasFilters = searchTerm || priorityFilter !== 'All' || statusFilter !== 'All' || assigneeFilter !== 'All';

    return (
        <div className="flex flex-wrap gap-3 mb-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 py-2 text-sm"
                />
            </div>

            {/* Priority Filter */}
            <div className="relative min-w-[120px]">
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="input-field py-2 text-sm appearance-none pr-8 cursor-pointer"
                >
                    <option value="All">Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
            </div>

            {/* Assignee Filter */}
            <div className="relative min-w-[140px]">
                <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="input-field py-2 text-sm appearance-none pr-8 cursor-pointer"
                >
                    <option value="All">Assignee</option>
                    {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
            </div>

            {/* Clear Filters */}
            {hasFilters && (
                <button
                    onClick={onClearFilters}
                    className="text-text-muted hover:text-text-main text-sm flex items-center gap-1 transition-colors"
                >
                    <X size={14} /> Clear
                </button>
            )}
        </div>
    );
};

// Create Task Modal Component
const CreateTaskModal = ({ isOpen, onClose, onSuccess, projects, defaultStatus = 'To Do' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        priority: 'Medium',
        status: defaultStatus,
        dueDate: '',
        estimatedHours: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                status: defaultStatus,
                title: '',
                description: '',
                dueDate: '',
                estimatedHours: ''
            }));
        }
    }, [isOpen, defaultStatus]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.project) {
            alert('Please fill in title and select a project');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : 0
            };
            const { data } = await api.post('/tasks', payload);
            if (data.success) {
                onSuccess(data.data);
                onClose();
            }
        } catch (error) {
            console.error('Failed to create task', error);
            alert(error.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-2xl border border-border shadow-2xl z-50">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <Plus size={20} className="text-primary-400" />
                        Create New Task
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Task Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-field min-h-[80px] resize-none"
                            placeholder="Describe the task..."
                        />
                    </div>

                    {/* Project */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Project *</label>
                        <select
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="">Select a project</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project._id}>{project.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="Open">Open</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date & Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Estimated Hours</label>
                            <input
                                type="number"
                                name="estimatedHours"
                                value={formData.estimatedHours}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

// Main Tasks Component
const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [projects, setProjects] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assigneeFilter, setAssigneeFilter] = useState('All');

    // Drag state
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Drawer state
    const [selectedTask, setSelectedTask] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Create task modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('To Do');

    // Toast state
    const [toast, setToast] = useState(null);

    // Permission check
    const canEdit = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(user?.role);

    useEffect(() => {
        fetchTasks();
        fetchTeamMembers();
        fetchProjects();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            if (data.success) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const { data } = await api.get('/dashboard/team?limit=100');
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch team members', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            if (data.success) {
                setProjects(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Drag handlers
    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        if (!draggedTask || draggedTask.status === newStatus) {
            setDragOverColumn(null);
            return;
        }

        const oldStatus = draggedTask.status;

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t._id === draggedTask._id ? { ...t, status: newStatus } : t
        ));

        try {
            await api.put(`/tasks/${draggedTask._id}`, { status: newStatus });
            showToast(`Task moved to ${newStatus}`);
        } catch (error) {
            // Revert on error
            setTasks(prev => prev.map(t =>
                t._id === draggedTask._id ? { ...t, status: oldStatus } : t
            ));
            showToast('Failed to move task', 'error');
        }

        setDraggedTask(null);
        setDragOverColumn(null);
    };

    // Filter tasks
    const getFilteredTasks = (status) => {
        return tasks.filter(task => {
            if (task.status !== status) return false;
            if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
            if (assigneeFilter !== 'All' && !task.assignedTo?.some(u => u._id === assigneeFilter)) return false;
            return true;
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setPriorityFilter('All');
        setStatusFilter('All');
        setAssigneeFilter('All');
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setDrawerOpen(true);
    };

    const handleEdit = (task) => {
        // TODO: Open edit modal
        console.log('Edit task:', task);
    };

    const handleDelete = async (task) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${task._id}`);
            setTasks(prev => prev.filter(t => t._id !== task._id));
            showToast('Task deleted');
        } catch (error) {
            showToast('Failed to delete task', 'error');
        }
    };

    const handleAssign = (task) => {
        // TODO: Open assign modal
        console.log('Assign task:', task);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main mb-1">Task Board</h1>
                    <p className="text-text-muted">Track and manage project tasks</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => { setDefaultStatus('To Do'); setCreateModalOpen(true); }}
                        className="btn-primary flex items-center gap-2 shrink-0"
                    >
                        <Plus size={18} /> New Task
                    </button>
                )}
            </div>

            {/* Filter Toolbar */}
            <FilterToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                assigneeFilter={assigneeFilter}
                setAssigneeFilter={setAssigneeFilter}
                teamMembers={teamMembers}
                onClearFilters={clearFilters}
            />

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden pb-4">
                <div className="flex gap-4 h-full">
                    {columns.map((column) => {
                        const columnTasks = getFilteredTasks(column.id);
                        const isDragOver = dragOverColumn === column.id;

                        return (
                            <div
                                key={column.id}
                                className={`
                                    flex-1 min-w-0 flex flex-col bg-background/40 rounded-xl border-2 transition-all duration-200
                                    ${isDragOver
                                        ? `${column.borderColor} bg-background/60 shadow-lg`
                                        : 'border-border'}
                                `}
                                onDragOver={(e) => handleDragOver(e, column.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                {/* Column Header */}
                                <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                        <h3 className="font-semibold text-text-main">{column.title}</h3>
                                    </div>
                                    <span className="bg-surface text-text-muted text-xs px-2 py-0.5 rounded-full font-medium">
                                        {columnTasks.length}
                                    </span>
                                </div>

                                {/* Task List */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                    {columnTasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onClick={handleTaskClick}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            canEdit={canEdit}
                                            isDragging={draggedTask?._id === task._id}
                                        />
                                    ))}

                                    {columnTasks.length === 0 && (
                                        <div className="text-center py-8 text-text-muted text-sm">
                                            No tasks
                                        </div>
                                    )}
                                </div>

                                {/* Add Task Button */}
                                {canEdit && (
                                    <button
                                        onClick={() => { setDefaultStatus(column.id); setCreateModalOpen(true); }}
                                        className="m-3 p-2.5 rounded-lg border border-dashed border-border text-text-muted hover:text-primary-400 hover:border-primary-500/30 text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
                                    >
                                        <Plus size={16} /> Add Task
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Task Details Drawer */}
            <TaskDetailsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                task={selectedTask}
                onTaskUpdated={fetchTasks}
                userRole={user?.role}
                canEdit={canEdit}
            />

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={(newTask) => {
                    setTasks(prev => [newTask, ...prev]);
                    showToast('Task created successfully');
                }}
                projects={projects}
                defaultStatus={defaultStatus}
            />

            {/* Toast Notification */}
            {toast && (
                <div className={`
                    fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg z-50 
                    flex items-center gap-2 animate-slide-up
                    ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white
                `}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Tasks;
