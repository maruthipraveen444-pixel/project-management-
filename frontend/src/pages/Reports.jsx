import { useState, useEffect, useMemo } from 'react';
import {
    FileText, Download, Calendar, Users, Filter,
    ChevronDown, X, Clock, AlertCircle, Check, BarChart3, LayoutGrid, User as UserIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Legend
} from 'recharts';
import api from '../utils/api';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as XLSX from 'xlsx';


// Departments list
const departments = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Operations'];

const Reports = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [records, setRecords] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [totals, setTotals] = useState({ totalHours: '0.00', totalOvertime: '0.00' });
    const [canViewAll, setCanViewAll] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [chartView, setChartView] = useState('user'); // 'user' or 'department'


    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [startDate, endDate, selectedUser, selectedDept, pagination.page]);

    const fetchTeamMembers = async () => {
        try {
            const { data } = await api.get('/dashboard/team?limit=100');
            if (data.success) {
                setTeamMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch team', error);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (selectedUser) params.append('userId', selectedUser);
            if (selectedDept) params.append('department', selectedDept);
            params.append('page', pagination.page);
            params.append('limit', 15);

            const { data } = await api.get(`/attendance?${params.toString()}`);
            if (data.success) {
                setRecords(data.data);
                setPagination(data.pagination);
                setTotals(data.totals);
                setCanViewAll(data.canViewAll);
            }
        } catch (error) {
            console.error('Failed to fetch records', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (selectedUser) params.append('userId', selectedUser);
            if (selectedDept) params.append('department', selectedDept);
            params.append('format', format);

            if (format === 'csv') {
                // Download CSV directly
                const response = await api.get(`/attendance/export?${params.toString()}`, {
                    responseType: 'blob'
                });
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                showToast('CSV exported successfully');
            } else {
                // Get JSON and generate Excel using SheetJS
                const { data } = await api.get(`/attendance/export?${params.toString()}`);
                if (data.success) {
                    // Create formatted data for Excel
                    const excelData = data.data.map(r => ({
                        'Name': r.name,
                        'Email': r.email,
                        'Department': r.department,
                        'Date': r.date,
                        'Punch In': r.punchIn,
                        'Punch Out': r.punchOut,
                        'Break (hrs)': r.breakHours,
                        'Total Hours': r.totalHours,
                        'Overtime': r.overtime
                    }));

                    // Add total row
                    excelData.push({
                        'Name': '',
                        'Email': '',
                        'Department': '',
                        'Date': 'TOTAL',
                        'Punch In': '',
                        'Punch Out': '',
                        'Break (hrs)': '',
                        'Total Hours': data.totals.totalHours,
                        'Overtime': data.totals.totalOvertime
                    });

                    // Create worksheet
                    const ws = XLSX.utils.json_to_sheet(excelData);

                    // Create workbook and append worksheet
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

                    // Generate buffer and trigger download
                    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);

                    const fileName = `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    showToast('Excel exported successfully');
                }
            }


        } catch (error) {
            console.error('Export failed', error);
            showToast('Export failed', 'error');
        } finally {
            setExporting(false);
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedUser('');
        setSelectedDept('');
    };

    const hasFilters = startDate || endDate || selectedUser || selectedDept;

    const dataForChart = useMemo(() => {
        if (!records.length) return [];

        const groupedData = {};

        records.forEach(record => {
            const key = chartView === 'user'
                ? (record.user?.name || 'Unknown')
                : (record.user?.department || 'Unassigned');

            if (!groupedData[key]) {
                groupedData[key] = {
                    name: key,
                    totalHours: 0,
                    overtime: 0
                };
            }

            groupedData[key].totalHours += record.totalHours || 0;
            groupedData[key].overtime += record.overtime || 0;
        });

        return Object.values(groupedData).map(item => ({
            ...item,
            totalHours: parseFloat(item.totalHours.toFixed(2)),
            overtime: parseFloat(item.overtime.toFixed(2))
        }));
    }, [records, chartView]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (

                <div className="bg-surface border border-border p-3 rounded-xl shadow-xl">
                    <p className="text-text-main font-semibold mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-text-muted">Total Hours:</span>
                            <span className="text-sm font-bold text-primary-400">{payload[0].value} hrs</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-text-muted">Overtime:</span>
                            <span className="text-sm font-bold text-orange-400">{payload[1].value} hrs</span>
                        </div>
                    </div>
                </div>
            );

        }
        return null;
    };


    const formatTime = (timeStr) => timeStr || '--:--';

    const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    const tooltipCursorColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Timesheet Reports</h1>
                    <p className="text-text-muted">View and export attendance records</p>
                </div>

                {canViewAll && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exporting}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FileText size={16} />
                            Export Excel
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="card glass p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Date Range */}
                    <div className="flex gap-2 items-center">
                        <div>
                            <label className="block text-xs text-text-muted mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field py-2 text-sm"
                            />
                        </div>
                        <span className="text-text-muted mt-5">to</span>
                        <div>
                            <label className="block text-xs text-text-muted mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* User Filter - Admin Only */}
                    {canViewAll && (
                        <div>
                            <label className="block text-xs text-text-muted mb-1">User</label>
                            <div className="relative">
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="input-field py-2 text-sm min-w-[150px] appearance-none pr-8"
                                >
                                    <option value="">All Users</option>
                                    {teamMembers.map((m) => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}

                    {/* Department Filter - Admin Only */}
                    {canViewAll && (
                        <div>
                            <label className="block text-xs text-text-muted mb-1">Department</label>
                            <div className="relative">
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="input-field py-2 text-sm min-w-[140px] appearance-none pr-8"
                                >
                                    <option value="">All Depts</option>
                                    {departments.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                            </div>
                        </div>
                    )}

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-text-muted hover:text-text-main text-sm flex items-center gap-1 transition-colors pb-2"
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Visualization Section */}
            <div className="card glass p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                            <BarChart3 size={20} className="text-primary-400" />
                            Work Hour Analysis
                        </h3>
                        <p className="text-xs text-text-muted">Comparing efforts by {chartView === 'user' ? 'team members' : 'departments'}</p>
                    </div>

                    <div className="flex bg-surface p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setChartView('user')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${chartView === 'user' ? 'bg-primary-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <UserIcon size={14} /> Users
                        </button>
                        <button
                            onClick={() => setChartView('department')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${chartView === 'department' ? 'bg-primary-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                        >
                            <LayoutGrid size={14} /> Depts
                        </button>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted">
                            <BarChart3 size={40} className="mb-2 opacity-20" />
                            <p>No data available for the chosen filters</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dataForChart}
                                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                barGap={8}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke={axisColor}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke={axisColor}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: tooltipCursorColor, opacity: 0.4 }} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                                />
                                <Bar
                                    dataKey="totalHours"
                                    name="Total Hours"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={24}
                                />
                                <Bar
                                    dataKey="overtime"
                                    name="Overtime"
                                    fill="#f97316"
                                    radius={[4, 4, 0, 0]}
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
                    <div>
                        <p className="text-xs text-text-muted mb-1">Total Records</p>
                        <p className="text-xl font-bold text-text-main">{pagination.total}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted mb-1">Total Worked</p>
                        <p className="text-xl font-bold text-text-main">{totals.totalHours} hrs</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted mb-1">Overall Overtime</p>
                        <p className="text-xl font-bold text-orange-400">{totals.totalOvertime} hrs</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-muted mb-1">Avg per Record</p>
                        <p className="text-xl font-bold text-primary-400">
                            {(totals.totalHours / (pagination.total || 1)).toFixed(1)} hrs
                        </p>
                    </div>
                </div>
            </div>


            {/* Table */}
            <div className="card glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface/50">
                            <tr>
                                {canViewAll && <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Name</th>}
                                {canViewAll && <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Department</th>}
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Punch In</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Punch Out</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Break</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Total Hours</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Overtime</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={canViewAll ? 9 : 7} className="px-4 py-12 text-center">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={canViewAll ? 9 : 7} className="px-4 py-12 text-center text-text-muted">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                records.map((record) => (
                                    <tr key={record._id} className="border-t border-border hover:bg-surface-hover/30">
                                        {canViewAll && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {record.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-text-main text-sm">{record.user?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                        )}
                                        {canViewAll && (
                                            <td className="px-4 py-3 text-sm text-text-muted">{record.user?.department || '-'}</td>
                                        )}
                                        <td className="px-4 py-3 text-sm text-text-main">
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-400">
                                            {record.punchInTime ? new Date(record.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-400">
                                            {record.punchOutTime ? new Date(record.punchOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text-muted">
                                            {(record.breakTime / 60).toFixed(1)} hrs
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-text-main">
                                            {record.totalHours?.toFixed(2) || '0.00'} hrs
                                        </td>
                                        <td className="px-4 py-3 text-sm text-orange-400">
                                            {record.overtime?.toFixed(2) || '0.00'} hrs
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${record.status === 'Completed'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {record.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-border flex justify-between items-center">
                        <p className="text-sm text-text-muted">
                            Page {pagination.page} of {pagination.pages} ({pagination.total} records)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="btn-secondary py-1 px-3 text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`
                    fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg z-50 
                    flex items-center gap-2 animate-slide-up
                    ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white
                `}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Reports;
