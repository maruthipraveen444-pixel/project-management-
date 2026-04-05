import { useState, useEffect } from 'react';
import {
    Activity, Filter, Download, RefreshCw, Search,
    User, FolderOpen, CheckSquare, Clock, Trash2, Edit, Plus, LogIn
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';

// Action icon mapping
const getActionIcon = (action) => {
    switch (action) {
        case 'CREATE': return <Plus size={14} className="text-green-400" />;
        case 'UPDATE': return <Edit size={14} className="text-blue-400" />;
        case 'DELETE': return <Trash2 size={14} className="text-red-400" />;
        case 'RESTORE': return <RefreshCw size={14} className="text-purple-400" />;
        case 'LOGIN': return <LogIn size={14} className="text-cyan-400" />;
        case 'PUNCH_IN': case 'PUNCH_OUT': return <Clock size={14} className="text-orange-400" />;
        default: return <Activity size={14} className="text-gray-400" />;
    }
};

// Entity type icon mapping
const getEntityIcon = (type) => {
    switch (type) {
        case 'User': return <User size={14} />;
        case 'Project': return <FolderOpen size={14} />;
        case 'Task': return <CheckSquare size={14} />;
        case 'Attendance': return <Clock size={14} />;
        default: return <Activity size={14} />;
    }
};

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        entityType: '',
        action: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
    const [showFilters, setShowFilters] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            });

            const { data } = await api.get(`/activity?${params}`);
            if (data.success) {
                setLogs(data.data);
                setPagination(prev => ({ ...prev, ...data.pagination }));
            }
        } catch (error) {
            console.error('Failed to fetch activity logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const handleExport = async () => {
        try {
            window.open(`${api.defaults.baseURL}/activity/export?format=csv`, '_blank');
        } catch (error) {
            console.error('Export failed', error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Activity className="text-primary-400" />
                        Activity Log
                    </h1>
                    <p className="text-text-muted text-sm mt-1">Track all system activities and changes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
                    >
                        <Filter size={16} />
                        Filters
                    </button>
                    <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={handleExport} className="btn-primary flex items-center gap-2">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card glass p-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Entity Type</label>
                            <select
                                value={filters.entityType}
                                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">All Types</option>
                                <option value="User">User</option>
                                <option value="Project">Project</option>
                                <option value="Task">Task</option>
                                <option value="Attendance">Attendance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Action</label>
                            <select
                                value={filters.action}
                                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="LOGIN">Login</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">From Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-muted mb-1">To Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setFilters({ entityType: '', action: '', startDate: '', endDate: '' })}
                            className="text-sm text-text-muted hover:text-text-main"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Activity Table */}
            <div className="card glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase">Timestamp</th>
                                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase">User</th>
                                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase">Action</th>
                                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase">Entity</th>
                                <th className="text-left p-4 text-xs font-medium text-text-muted uppercase">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-text-muted">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="border-b border-border hover:bg-surface-hover/30 transition-colors">
                                        <td className="p-4">
                                            <p className="text-sm text-text-main">
                                                {format(new Date(log.timestamp), 'MMM d, yyyy')}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {format(new Date(log.timestamp), 'h:mm:ss a')}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={log.user?.photo || `https://ui-avatars.com/api/?name=${log.userName}&background=random`}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <p className="text-sm text-text-main">{log.userName}</p>
                                                    <p className="text-xs text-text-muted">{log.userRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 text-sm">
                                                {getActionIcon(log.action)}
                                                <span className="text-text-main">{log.action}</span>
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-2 text-sm">
                                                {getEntityIcon(log.entityType)}
                                                <span className="text-text-muted">{log.entityType}</span>
                                            </span>
                                            {log.entityName && (
                                                <p className="text-xs text-text-muted mt-0.5">{log.entityName}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {log.projectName && (
                                                <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded">
                                                    {log.projectName}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t border-border">
                        <p className="text-sm text-text-muted">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn-secondary text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.pages}
                                className="btn-secondary text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
