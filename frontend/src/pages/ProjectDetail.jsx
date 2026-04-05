import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, User, Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, MoreVertical, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/common/UserAvatar';
import RoleIcon from '../components/common/RoleIcon';



// Task Modal for Create/Edit
const TaskModal = ({ isOpen, onClose, onSubmit, task = null, loading, members = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
        assignedTo: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'To Do',
                priority: task.priority || 'Medium',
                dueDate: task.dueDate?.split('T')[0] || '',
                assignedTo: task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0]._id : ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'To Do',
                priority: 'Medium',
                dueDate: '',
                assignedTo: ''
            });
        }
    }, [task, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert single assignedTo to array of IDs or empty array
        const submitData = {
            ...formData,
            assignedTo: formData.assignedTo ? [formData.assignedTo] : []
        };
        onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-text-main">{task ? 'Edit Task' : 'Add New Task'}</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Task Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            placeholder="Enter task title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[80px] resize-none"
                            placeholder="Task description"
                            rows={2}
                        />
                    </div>

                    {/* Assigned To Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Assigned To</label>
                        <select
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Unassigned</option>
                            {members.map(member => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="input-field"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="input-field"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Due Date</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="input-field"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 btn-primary">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : task ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All'); // Filter state
    const { user } = useAuth();

    // Matrix rule: Only assigned PM or Super Admin can edit project
    const isSuperAdmin = user?.role === 'Super Admin';
    const canEditProject = isSuperAdmin || (user?.role === 'Project Manager' && project?.projectLead?._id === user?._id);

    // Matrix rule: PM can only manage tasks in their own project. Team Leads can manage tasks in projects they are part of.
    const canEditTask = isSuperAdmin ||
        (user?.role === 'Project Manager' && project?.projectLead?._id === user?._id) ||
        (user?.role === 'Team Lead');




    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            const [projectRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks?project=${id}`)
            ]);
            if (projectRes.data.success) setProject(projectRes.data.data);
            if (tasksRes.data.success) setTasks(tasksRes.data.data);
        } catch (error) {
            console.error('Failed to fetch project data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (formData) => {
        setActionLoading(true);
        try {
            const { data } = await api.post('/tasks', { ...formData, project: id });
            if (data.success) {
                setTasks(prev => [...prev, data.data]);
                setShowTaskModal(false);
                updateProgress([...tasks, data.data]);
            }
        } catch (error) {
            console.error('Failed to create task', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateTask = async (formData) => {
        setActionLoading(true);
        try {
            const { data } = await api.put(`/tasks/${selectedTask._id}`, formData);
            if (data.success) {
                const updatedTasks = tasks.map(t => t._id === selectedTask._id ? data.data : t);
                setTasks(updatedTasks);
                setShowTaskModal(false);
                setSelectedTask(null);
                updateProgress(updatedTasks);
            }
        } catch (error) {
            console.error('Failed to update task', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            const { data } = await api.delete(`/tasks/${taskId}`);
            if (data.success) {
                const updatedTasks = tasks.filter(t => t._id !== taskId);
                setTasks(updatedTasks);
                updateProgress(updatedTasks);
            }
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
            if (data.success) {
                const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
                setTasks(updatedTasks);
                updateProgress(updatedTasks);
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const updateProgress = async (currentTasks) => {
        const total = currentTasks.length;
        const done = currentTasks.filter(t => t.status === 'Completed').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        try {
            await api.put(`/projects/${id}`, { progress });
            setProject(prev => ({ ...prev, progress }));
        } catch (error) {
            console.error('Failed to update progress', error);
        }
    };

    const handleProjectStatusChange = async (newStatus) => {
        try {
            const { data } = await api.put(`/projects/${id}`, { status: newStatus });
            if (data.success) {
                setProject(data.data);
            }
        } catch (error) {
            console.error('Failed to update project status', error);
        }
    };

    const handleProjectMilestoneChange = async (newMilestone) => {
        try {
            const { data } = await api.put(`/projects/${id}`, { currentMilestone: newMilestone });
            if (data.success) {
                setProject(data.data);
            }
        } catch (error) {
            console.error('Failed to update project milestone', error);
        }
    };



    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-yellow-400';
            default: return 'text-green-400';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-surface rounded w-48"></div>
                <div className="h-64 bg-surface rounded-xl"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted mb-4">Project not found</p>
                <button onClick={() => navigate('/projects')} className="btn-primary">Back to Projects</button>
            </div>
        );
    }

    const todoTasks = tasks.filter(t => t.status === 'To Do');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const doneTasks = tasks.filter(t => t.status === 'Completed');

    // Get unique team members
    const allMembers = project ? [
        project.projectLead,
        ...(project.teamMembers?.map(m => m.user) || [])
    ].filter(Boolean) : [];

    // Remove duplicates based on _id
    const uniqueMembers = Array.from(new Map(allMembers.map(item => [item._id, item])).values());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/projects')} className="p-2 rounded-lg bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: project.color || '#3b82f6' }}>
                            {project.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">{project.name}</h1>
                            <p className="text-text-muted text-sm">{project.description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canEditProject ? (
                        <select
                            value={project.currentMilestone}
                            onChange={(e) => handleProjectMilestoneChange(e.target.value)}
                            className="px-3 py-1 rounded-lg text-sm border bg-surface text-text-main cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 border-primary-500/20"
                        >
                            <option value="Planning">Planning</option>
                            <option value="Design">Design</option>
                            <option value="Development">Development</option>
                            <option value="Testing">Testing</option>
                            <option value="Deployment">Deployment</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    ) : (
                        <span className="px-3 py-1 rounded-lg text-sm border bg-primary-500/10 text-primary-400 border-primary-500/20">
                            {project.currentMilestone}
                        </span>
                    )}

                    {canEditProject ? (
                        <select
                            value={project.status}
                            onChange={(e) => handleProjectStatusChange(e.target.value)}
                            className={`px-3 py-1 rounded-lg text-sm border bg-surface text-text-main cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${project.status === 'Active' ? 'border-green-500/20' : project.status === 'Completed' ? 'border-blue-500/20' : 'border-gray-500/20'}`}
                        >
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    ) : (
                        <span className={`px-3 py-1 rounded-lg text-sm border ${project.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : project.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                            {project.status}
                        </span>
                    )}
                </div>


            </div>

            {/* Stats Cards - Clickable Filters */}
            <div className="grid grid-cols-4 gap-4">
                <div
                    onClick={() => setStatusFilter('All')}
                    className={`card p-4 cursor-pointer transition-all ${statusFilter === 'All' ? 'ring-2 ring-primary-500 bg-surface' : 'hover:bg-surface-hover'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center"><Users className="text-primary-400" size={20} /></div>
                        <div><p className="text-text-muted text-xs">All Tasks</p><p className="text-xl font-bold text-text-main">{tasks.length}</p></div>
                    </div>
                </div>
                <div
                    onClick={() => setStatusFilter('To Do')}
                    className={`card p-4 cursor-pointer transition-all ${statusFilter === 'To Do' ? 'ring-2 ring-blue-500 bg-surface' : 'hover:bg-surface-hover'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Clock className="text-blue-400" size={20} /></div>
                        <div><p className="text-text-muted text-xs">To Do</p><p className="text-xl font-bold text-text-main">{todoTasks.length}</p></div>
                    </div>
                </div>
                <div
                    onClick={() => setStatusFilter('In Progress')}
                    className={`card p-4 cursor-pointer transition-all ${statusFilter === 'In Progress' ? 'ring-2 ring-yellow-500 bg-surface' : 'hover:bg-surface-hover'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center"><AlertTriangle className="text-yellow-400" size={20} /></div>
                        <div><p className="text-text-muted text-xs">In Progress</p><p className="text-xl font-bold text-text-main">{inProgressTasks.length}</p></div>
                    </div>
                </div>
                <div
                    onClick={() => setStatusFilter('Completed')}
                    className={`card p-4 cursor-pointer transition-all ${statusFilter === 'Completed' ? 'ring-2 ring-green-500 bg-surface' : 'hover:bg-surface-hover'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><CheckCircle className="text-green-400" size={20} /></div>
                        <div><p className="text-text-muted text-xs">Completed</p><p className="text-xl font-bold text-text-main">{doneTasks.length}</p></div>
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-main">Tasks</h2>
                {canEditTask && (
                    <button onClick={() => { setSelectedTask(null); setShowTaskModal(true); }} className="btn-primary flex items-center gap-2 text-sm py-2">
                        <Plus size={16} /> Add Task
                    </button>
                )}
            </div>

            {/* Task List */}
            {(statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter)).length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-text-muted mb-4">{statusFilter === 'All' ? 'No tasks yet. Create your first task!' : `No ${statusFilter} tasks`}</p>
                    {canEditTask && <button onClick={() => { setSelectedTask(null); setShowTaskModal(true); }} className="btn-primary">Add Task</button>}
                </div>
            ) : (
                <div className="space-y-3">
                    {(statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter)).map((task) => (
                        <div key={task._id} className="card p-4 flex items-center justify-between hover:border-text-muted/20 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <input
                                    type="checkbox"
                                    checked={task.status === 'Completed'}
                                    onChange={() => handleStatusChange(task._id, task.status === 'Completed' ? 'To Do' : 'Completed')}
                                    className="w-5 h-5 rounded border-text-muted/20 bg-background text-primary-500 focus:ring-primary-500/40 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <h4 className={`font-medium ${task.status === 'Completed' ? 'text-text-muted line-through' : 'text-text-main'}`}>{task.title}</h4>
                                    {task.description && <p className="text-text-muted text-sm mt-1 line-clamp-1">{task.description}</p>}
                                    {/* Display Assignee if available */}
                                    {task.assignedTo && task.assignedTo.length > 0 && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <UserAvatar user={task.assignedTo[0]} size="xs" />
                                            <div className="flex items-center gap-1">
                                                <RoleIcon role={task.assignedTo[0].role} size={10} />
                                                <span className="text-xs text-text-muted">{task.assignedTo[0].name}</span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                    className="text-xs px-2 py-1 rounded border bg-surface text-text-main border-border cursor-pointer focus:outline-none"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="To Do" className="bg-surface text-text-main">To Do</option>
                                    <option value="In Progress" className="bg-surface text-text-main">In Progress</option>
                                    <option value="Completed" className="bg-surface text-text-main">Completed</option>
                                </select>
                                {task.dueDate && (
                                    <span className="text-xs text-text-muted flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                                <button onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} className="p-1 text-text-muted hover:text-text-main"><Edit size={16} /></button>
                                <button onClick={() => handleDeleteTask(task._id)} className="p-1 text-text-muted hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Modal */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
                onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
                task={selectedTask}
                loading={actionLoading}
                members={uniqueMembers}
            />
        </div>
    );
};

export default ProjectDetail;
