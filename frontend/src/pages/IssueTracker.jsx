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


    // shared select style
    const selSt = {
        padding: '0.5rem 2rem 0.5rem 0.875rem',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'var(--text-primary)',
        fontSize: '0.8125rem',
        fontFamily: 'inherit',
        appearance: 'none',
        outline: 'none',
        cursor: 'pointer',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c8db5' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.625rem center',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                             style={{ background:'rgba(91,156,246,0.1)', border:'1px solid rgba(91,156,246,0.25)', color:'#5b9cf6' }}>
                            <Filter size={10}/> Tracker
                        </div>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight"
                        style={{ background:'linear-gradient(135deg,#eef2ff 0%,#93c5fd 50%,#c4b5fd 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                        Issue Tracker
                    </h1>
                    <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>Manage and track project issues</p>
                </div>
                {['Team Member', 'Tester'].includes(user?.role) && (
                    <button onClick={handleCreateIssue} className="btn-primary flex items-center gap-2">
                        <Plus size={16}/> Report Issue
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center p-4 rounded-[18px]"
                 style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2" style={{ color:'rgba(255,255,255,0.4)' }}>
                    <Filter size={14}/>
                    <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                </div>

                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={selSt}
                        onFocus={e=>{e.target.style.borderColor='rgba(91,156,246,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)';}}
                        onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='';}}>
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>

                <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} style={selSt}
                        onFocus={e=>{e.target.style.borderColor='rgba(91,156,246,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)';}}
                        onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='';}}>
                    <option value="">All Priority</option>
                    <option value="Immediate">Immediate</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                </select>

                <select value={filters.severity} onChange={e => setFilters({...filters, severity: e.target.value})} style={selSt}
                        onFocus={e=>{e.target.style.borderColor='rgba(91,156,246,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)';}}
                        onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='';}}>
                    <option value="">All Severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Issues List */}
            <div className="overflow-hidden rounded-[18px]" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:'rgba(91,156,246,0.3)', borderTopColor:'#5b9cf6' }}/>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16" style={{ color:'rgba(255,255,255,0.25)' }}>
                        <Bug className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">No issues found</p>
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
