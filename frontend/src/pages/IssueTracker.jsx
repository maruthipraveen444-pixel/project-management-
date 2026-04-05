import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, Search, AlertCircle, CheckCircle, Clock, XCircle, Bug, GitPullRequest, ListTodo } from 'lucide-react';
import axios from 'axios';
import IssueModal from '../components/issues/IssueModal';
import { toast } from 'react-hot-toast';

const IssueTracker = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        severity: '',
        assignedTo: ''
    });

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const res = await axios.get(`http://localhost:5000/api/issues?${queryParams}`, {
                withCredentials: true
            });
            setIssues(res.data);
        } catch (error) {
            console.error('Error fetching issues:', error);
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [filters]);

    const handleCreateIssue = () => {
        setSelectedIssue(null);
        setShowModal(true);
    };

    const handleEditIssue = (issue) => {
        setSelectedIssue(issue);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        fetchIssues(); // Refresh list after close
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Testing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'Immediate': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'High': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'Normal': return <Clock className="w-4 h-4 text-blue-500" />;
            case 'Low': return <Clock className="w-4 h-4 text-gray-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Bug': return <Bug className="w-4 h-4 text-red-400" />;
            case 'Enhancement': return <GitPullRequest className="w-4 h-4 text-green-400" />;
            case 'Task Issue': return <ListTodo className="w-4 h-4 text-blue-400" />;
            default: return <Bug className="w-4 h-4 text-gray-400" />;
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Issue Tracker</h1>
                    <p className="text-text-muted text-sm mt-1">Manage and track project issues</p>
                </div>
                {['Team Member', 'Tester'].includes(user?.role) && (
                    <button
                        onClick={handleCreateIssue}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Report Issue
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-surface p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-text-muted">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="bg-background border border-border text-text-main text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
                >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="bg-background border border-border text-text-main text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
                >
                    <option value="">All Priority</option>
                    <option value="Immediate">Immediate</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                </select>
                <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="bg-background border border-border text-text-main text-sm rounded-lg px-3 py-2 outline-none focus:border-primary-500"
                >
                    <option value="">All Severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Issues List */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                        <Bug className="w-12 h-12 mb-3 opacity-20" />
                        <p>No issues found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface/50 text-text-muted text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Severity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Reported By</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {issues.map((issue) => (
                                    <tr
                                        key={issue._id}
                                        onClick={() => handleEditIssue(issue)}
                                        className="hover:bg-surface-hover/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(issue.category)}
                                                <span className="text-text-main">{issue.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-text-main font-medium truncate max-w-xs">{issue.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getPriorityIcon(issue.priority)}
                                                <span className="text-text-muted">{issue.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${issue.severity === 'Critical' ? 'text-red-500 font-bold' : issue.severity === 'High' ? 'text-orange-500' : 'text-text-muted'}`}>
                                                {issue.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {issue.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={issue.assignedTo.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(issue.assignedTo.name)}&background=random`}
                                                        alt={issue.assignedTo.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="text-text-main text-sm">{issue.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-text-muted text-sm italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-text-muted text-sm">{issue.reportedBy?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <IssueModal
                    isOpen={showModal}
                    onClose={closeModal}
                    issue={selectedIssue}
                    onSuccess={closeModal}
                />
            )}
        </div>
    );
};

export default IssueTracker;
