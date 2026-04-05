import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Calendar, X, Trash2, Edit, UserPlus, Users, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AssignMembersModal from '../components/AssignMembersModal';
import UserAvatar from '../components/common/UserAvatar';


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

// Create/Edit Project Modal Component
const ProjectModal = ({ isOpen, onClose, onSubmit, project = null, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        color: '#3b82f6',
        currentMilestone: ''
    });


    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'Active',
                startDate: project.startDate?.split('T')[0] || '',
                endDate: project.endDate?.split('T')[0] || '',
                color: project.color || '#3b82f6',
                currentMilestone: project.currentMilestone || ''
            });

        } else {
            setFormData({
                name: '',
                description: '',
                status: 'Active',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                color: '#3b82f6',
                currentMilestone: ''
            });

        }
    }, [project, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface rounded-2xl border border-border w-full max-w-lg mx-4 shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-text-main">
                        {project ? 'Edit Project' : 'Create New Project'}
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Brief description of the project"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="input-field"
                        >
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Milestone *</label>
                        <select
                            value={formData.currentMilestone}
                            onChange={(e) => setFormData({ ...formData, currentMilestone: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="" disabled>Select milestone</option>
                            <option value="Planning">Planning</option>
                            <option value="Design">Design</option>
                            <option value="Development">Development</option>
                            <option value="Testing">Testing</option>
                            <option value="Deployment">Deployment</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Project Color</label>
                        <div className="flex gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 btn-primary">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                            ) : project ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, projectName, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface rounded-2xl border border-border w-full max-w-sm mx-4 p-6 shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="text-red-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-text-main mb-2">Delete Project?</h3>
                    <p className="text-text-muted text-sm mb-6">
                        Are you sure you want to delete "<span className="text-text-main">{projectName}</span>"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Projects = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    // Filter states
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [milestoneFilter, setMilestoneFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const milestones = ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Maintenance'];

    const hasActiveFilters = searchQuery || milestoneFilter || startDateFilter || endDateFilter;

    const clearAllFilters = () => {
        setSearchQuery('');
        setMilestoneFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Role check helpers
    const isSuperAdmin = user?.role === 'Super Admin';
    const canCreateProject = ['Super Admin', 'Project Admin', 'Project Manager'].includes(user?.role);

    const canEditProject = (project) => {
        if (isSuperAdmin) return true;

        // PM can only edit if they are the lead
        const leadId = typeof project.projectLead === 'object' ? project.projectLead._id : project.projectLead;
        return user?.role === 'Project Manager' && leadId === user?._id;
    };



    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            if (data.success) {
                setProjects(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.openCreateModal) {
            setShowModal(true);
            // Clear the state to prevent reopening on refresh (optional, but handled by navigation history usually)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (formData) => {
        setActionLoading(true);
        try {
            const { data } = await api.post('/projects', formData);
            if (data.success) {
                setProjects(prev => [data.data, ...prev]);
                setShowModal(false);
            }
        } catch (error) {
            console.error('Failed to create project', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateProject = async (formData) => {
        setActionLoading(true);
        try {
            const { data } = await api.put(`/projects/${selectedProject._id}`, formData);
            if (data.success) {
                setProjects(prev => prev.map(p => p._id === selectedProject._id ? data.data : p));
                setShowModal(false);
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Failed to update project', error);
            alert('Failed to update project. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        setActionLoading(true);
        try {
            const { data } = await api.delete(`/projects/${selectedProject._id}`);
            if (data.success) {
                setProjects(prev => prev.filter(p => p._id !== selectedProject._id));
                setShowDeleteModal(false);
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Failed to delete project', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (project) => {
        setSelectedProject(project);
        setActiveMenu(null);
        setShowModal(true);
    };

    const openDeleteModal = (project) => {
        setSelectedProject(project);
        setActiveMenu(null);
        setShowDeleteModal(true);
    };

    const filteredProjects = projects.filter(p => {
        // Status tab filter
        if (filter !== 'All' && p.status !== filter) return false;

        // Search query filter
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Milestone filter
        if (milestoneFilter && p.currentMilestone !== milestoneFilter) return false;

        // Date range filter (based on project end date)
        if (startDateFilter && p.endDate && new Date(p.endDate) < new Date(startDateFilter)) return false;
        if (endDateFilter && p.endDate && new Date(p.endDate) > new Date(endDateFilter)) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main mb-1">Projects</h1>
                    <p className="text-text-muted">Manage your ongoing projects and milestones</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`btn-secondary flex items-center gap-2 ${hasActiveFilters ? 'ring-2 ring-primary-500' : ''}`}
                        >
                            <Filter size={18} />
                            Filter
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            )}
                        </button>

                        {/* Filter Panel Dropdown */}
                        {showFilterPanel && (
                            <div className="absolute right-0 top-12 w-80 bg-surface rounded-xl border border-border shadow-2xl z-20 p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-text-main font-semibold">Filters</h4>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs text-primary-400 hover:text-primary-300"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Search */}
                                <div>
                                    <label className="block text-xs text-text-muted mb-1">Search</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Project name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="input-field pl-9 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Milestone */}
                                <div>
                                    <label className="block text-xs text-text-muted mb-1">Milestone</label>
                                    <div className="relative">
                                        <select
                                            value={milestoneFilter}
                                            onChange={(e) => setMilestoneFilter(e.target.value)}
                                            className="input-field py-2 text-sm appearance-none pr-8"
                                        >
                                            <option value="">All Milestones</option>
                                            {milestones.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-xs text-text-muted mb-1">Deadline Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-dark-500 mb-0.5">From</label>
                                            <input
                                                type="date"
                                                value={startDateFilter}
                                                onChange={(e) => setStartDateFilter(e.target.value)}
                                                className="input-field py-2 text-sm w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-dark-500 mb-0.5">To</label>
                                            <input
                                                type="date"
                                                value={endDateFilter}
                                                onChange={(e) => setEndDateFilter(e.target.value)}
                                                className="input-field py-2 text-sm w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowFilterPanel(false)}
                                    className="w-full btn-primary py-2 text-sm"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>
                    {canCreateProject && (
                        <button
                            onClick={() => { setSelectedProject(null); setShowModal(true); }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={18} /> New Project
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-border">
                {['All', 'Active', 'Completed', 'On Hold'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${filter === tab ? 'text-primary-400' : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        {tab}
                        {filter === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {loading ? (
                    [1, 2, 3].map((i) => <div key={i} className="h-64 bg-surface rounded-xl animate-pulse"></div>)
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="text-text-muted mb-4">
                            <Plus size={48} className="mx-auto opacity-50" />
                        </div>
                        <p className="text-text-muted mb-4">No projects found.</p>
                        {canCreateProject && (
                            <button
                                onClick={() => { setSelectedProject(null); setShowModal(true); }}
                                className="btn-primary"
                            >
                                Create Your First Project
                            </button>
                        )}
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <div key={project._id} className="card glass hover:border-text-muted/20 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-text-main shadow-lg"
                                    style={{ backgroundColor: project.color || '#3b82f6' }}
                                >
                                    {project.name.charAt(0)}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`px-2 py-1 rounded text-xs border ${project.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        project.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {project.status}
                                    </span>
                                    {project.currentMilestone && (
                                        <span className="px-2 py-1 rounded text-xs border bg-primary-500/10 text-primary-400 border-primary-500/20">
                                            {project.currentMilestone}
                                        </span>
                                    )}

                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === project._id ? null : project._id)}
                                            className="text-text-muted hover:text-text-main p-1 rounded hover:bg-surface-hover transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {activeMenu === project._id && (
                                            <div className="absolute right-0 top-8 bg-surface rounded-lg border border-border shadow-xl z-10 py-1 min-w-[160px]">
                                                {canEditProject(project) && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setShowAssignModal(true);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-surface-hover flex items-center gap-2"
                                                    >
                                                        <Users size={14} /> Assign Members
                                                    </button>
                                                )}
                                                {canEditProject(project) && (
                                                    <button
                                                        onClick={() => openEditModal(project)}
                                                        className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-surface-hover flex items-center gap-2"
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                )}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => openDeleteModal(project)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-surface-hover flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-text-main mb-2">{project.name}</h3>
                            <p className="text-sm text-text-muted mb-6 line-clamp-2 h-10">{project.description}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-text-muted">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                    <div>
                                        {project.totalTasks || 0} Tasks
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <div className="flex -space-x-2 items-center">
                                        {project.teamMembers?.slice(0, 3).map((member, i) => (
                                            <UserAvatar
                                                key={i}
                                                user={member.user}
                                                size="sm"
                                                showBadge={false}
                                                className="ring-2 ring-surface"
                                            />
                                        ))}

                                        {(project.teamMembers?.length > 3) && (
                                            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-hover flex items-center justify-center text-xs text-text-main">
                                                +{project.teamMembers.length - 3}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => navigate(`/projects/${project._id}`)}
                                            className="w-8 h-8 rounded-full border-2 border-dashed border-text-muted/50 bg-background flex items-center justify-center text-text-muted hover:text-primary-400 hover:border-primary-400 transition-colors ml-1"
                                            title="Add team member"
                                        >
                                            <UserPlus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                        className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <ProjectModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setSelectedProject(null); }}
                onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
                project={selectedProject}
                loading={actionLoading}
            />

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setSelectedProject(null); }}
                onConfirm={handleDeleteProject}
                projectName={selectedProject?.name}
                loading={actionLoading}
            />

            {/* Assign Members Modal */}
            <AssignMembersModal
                isOpen={showAssignModal}
                onClose={() => { setShowAssignModal(false); setSelectedProject(null); }}
                project={selectedProject}
                onMembersUpdated={fetchProjects}
                userRole={user?.role}
            />
        </div>
    );
};

export default Projects;
