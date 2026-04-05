import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, User, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const IssueModal = ({ isOpen, onClose, issue, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '', // Would normally populate from props or fetch projects
        priority: 'Normal',
        severity: 'Medium',
        category: 'Bug',
        status: 'Open',
        assignedTo: ''
    });
    const [projects, setProjects] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
            if (issue) {
                setFormData({
                    title: issue.title,
                    description: issue.description,
                    project: issue.project?._id || issue.project,
                    priority: issue.priority,
                    severity: issue.severity,
                    category: issue.category,
                    status: issue.status,
                    assignedTo: issue.assignedTo?._id || issue.assignedTo || ''
                });
                if (issue.project) {
                    fetchProjectMembers(issue.project?._id || issue.project);
                }
            } else {
                // Reset form for new issue
                setFormData({
                    title: '',
                    description: '',
                    project: '',
                    priority: 'Normal',
                    severity: 'Medium',
                    category: 'Bug',
                    status: 'Open',
                    assignedTo: ''
                });
            }
        }
    }, [isOpen, issue]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/projects', { withCredentials: true });
            if (res.data.success) { // Controller wraps in success: true
                setProjects(res.data.data);
            } else {
                setProjects(res.data); // Fallback if direct array
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchProjectMembers = async (projectId) => {
        if (!projectId) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`, { withCredentials: true });
            if (res.data.success) {
                const members = res.data.data.teamMembers.map(m => m.user);
                // Add Project Lead/Manager too if not in list?
                if (res.data.data.projectLead) members.push(res.data.data.projectLead);
                // Filter duplicates
                const uniqueMembers = [...new Map(members.map(v => [v._id, v])).values()];

                setTeamMembers(uniqueMembers);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    }

    const handleProjectChange = (e) => {
        const projectId = e.target.value;
        setFormData({ ...formData, project: projectId });
        fetchProjectMembers(projectId);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (issue) {
                // Edit Mode
                // Determine what to update based on role
                if (['Project Manager', 'Team Lead'].includes(user.role)) {
                    // Can update assignment and status
                    if (formData.assignedTo !== (issue.assignedTo?._id || issue.assignedTo)) {
                        await axios.put(`http://localhost:5000/api/issues/${issue._id}/assign`, { assignedTo: formData.assignedTo }, { withCredentials: true });
                    }
                    if (formData.status !== issue.status) {
                        await axios.put(`http://localhost:5000/api/issues/${issue._id}/status`, { status: formData.status }, { withCredentials: true });
                    }
                    // For PMs, maybe allow full edit? But requirements focus on Assignment/Status.
                    // Let's assume title/description editing is less critical or allowed for reportedBy.
                    toast.success('Issue updated successfully');
                } else {
                    // Regular user update status (e.g. In Progress)
                    if (formData.status !== issue.status) {
                        await axios.put(`http://localhost:5000/api/issues/${issue._id}/status`, { status: formData.status }, { withCredentials: true });
                        toast.success('Status updated');
                    }
                }

            } else {
                // Create Mode
                await axios.post('http://localhost:5000/api/issues', formData, { withCredentials: true });
                toast.success('Issue created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const canEditDetails = !issue; // Only create mode allows editing details for now (simplification)
    const canAssign = ['Project Manager', 'Team Lead'].includes(user?.role);
    const canChangeStatus = true; // All roles can change status (limited by backend)

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-surface border-b border-border p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-text-main">
                        {issue ? 'Issue Details' : 'Report New Issue'}
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Title & Type - Only editable on Create */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-sm font-medium text-text-muted">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                placeholder="Issue Summary"
                                required
                                disabled={!canEditDetails}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Type</label>
                            <select
                                value={formData.category} // Using category as Type
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                disabled={!canEditDetails}
                            >
                                <option value="Bug">Bug</option>
                                <option value="Enhancement">Enhancement</option>
                                <option value="Task Issue">Task Issue</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 min-h-[120px] resize-y disabled:opacity-50"
                            placeholder="Detailed description of the issue..."
                            required
                            disabled={!canEditDetails}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Project</label>
                            <select
                                value={formData.project}
                                onChange={handleProjectChange}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                required
                                disabled={!canEditDetails}
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Severity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                disabled={!canEditDetails}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                disabled={!canEditDetails}
                            >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Immediate">Immediate</option>
                            </select>
                        </div>

                        {/* Status (Editable by all with backend logic) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-background border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500 disabled:opacity-50"
                                disabled={!canChangeStatus}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Testing">Testing</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignment - Only PM/Team Lead */}
                    {canAssign && (
                        <div className="space-y-2 bg-background/50 p-4 rounded-lg border border-border">
                            <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Assign To (PM/Team Lead Only)
                            </label>
                            <select
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                className="w-full bg-surface border border-border text-text-main rounded-lg px-4 py-2.5 outline-none focus:border-primary-500"
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map(member => (
                                    <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {issue && !canAssign && issue.assignedTo && (
                        <div className="p-4 bg-background/30 rounded-lg flex items-center gap-3">
                            <div className="text-sm text-text-muted">Assigned To:</div>
                            <div className="flex items-center gap-2">
                                <img src={issue.assignedTo.photo || 'https://via.placeholder.com/30'} className="w-6 h-6 rounded-full" alt="" />
                                <span className="text-text-main font-medium">{issue.assignedTo.name}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {issue ? 'Update Issue' : 'Report Issue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueModal;
