import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Clock, Calendar, Coffee, X, History, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

// Timesheet History Modal
const TimesheetHistoryModal = ({ isOpen, onClose }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState('current');

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, selectedWeek]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/attendance/records');
            if (data.success) {
                setRecords(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl w-full max-w-lg border border-border shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <History className="text-primary-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main">Timesheet History</h2>
                            <p className="text-xs text-text-muted">Your work hours record</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Week Selector */}
                <div className="p-4 border-b border-dark-700">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedWeek('current')}
                            className={`px-4 py-2 text-sm rounded-lg transition-all ${selectedWeek === 'current'
                                ? 'bg-primary-500 text-white'
                                : 'bg-background text-text-muted hover:bg-surface-hover'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setSelectedWeek('last')}
                            className={`px-4 py-2 text-sm rounded-lg transition-all ${selectedWeek === 'last'
                                ? 'bg-primary-500 text-white'
                                : 'bg-background text-text-muted hover:bg-surface-hover'
                                }`}
                        >
                            Last Week
                        </button>
                        <button
                            onClick={() => setSelectedWeek('month')}
                            className={`px-4 py-2 text-sm rounded-lg transition-all ${selectedWeek === 'month'
                                ? 'bg-primary-500 text-white'
                                : 'bg-background text-text-muted hover:bg-surface-hover'
                                }`}
                        >
                            This Month
                        </button>
                    </div>
                </div>

                {/* Records List */}
                <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="mx-auto text-text-muted mb-2" size={32} />
                            <p className="text-text-muted">No records found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record, index) => (
                                <div
                                    key={record._id || index}
                                    className="p-3 bg-background/50 rounded-lg border border-border hover:border-primary-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-text-main">
                                                {format(new Date(record.date), 'EEE, MMM d')}
                                            </p>
                                            <p className="text-xs text-dark-400">
                                                {record.punchIn && format(new Date(record.punchIn), 'h:mm a')}
                                                {record.punchOut && ` - ${format(new Date(record.punchOut), 'h:mm a')}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-primary-400">
                                                {(record.totalHours || 0).toFixed(1)} hrs
                                            </p>
                                            <p className="text-xs text-dark-400">
                                                {record.status || 'Completed'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Total */}
                <div className="p-4 border-t border-border bg-surface">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">Total Hours</span>
                        <span className="text-lg font-bold text-primary-400">{totalHours.toFixed(1)} hrs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AttendanceCard = ({ attendance, user }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [status, setStatus] = useState({
        isPunchedIn: user?.currentStatus?.isPunchedIn || false,
        punchInTime: user?.currentStatus?.punchInTime || null,
        workedHoursToday: user?.currentStatus?.workedHoursToday || 0
    });

    useEffect(() => {
        // Update clock every second
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePunch = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/attendance/punch');
            if (data.success) {
                setStatus({
                    isPunchedIn: data.data.isPunchedIn,
                    punchInTime: data.data.punchInTime,
                    workedHoursToday: parseFloat(data.data.totalHours || data.data.workedHours || 0)
                });
            }
        } catch (error) {
            console.error('Punch failed', error);
            alert(error.response?.data?.message || 'Punch failed');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    return (
        <>
            <div className="card glass relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-main">Timesheet</h3>
                        <p className="text-xs text-text-muted">{new Date().toDateString()}</p>
                    </div>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="bg-surface p-2 rounded-lg border border-border hover:border-primary-500/50 hover:bg-surface-hover transition-all cursor-pointer"
                        title="View History"
                    >
                        <Clock className="text-primary-500" size={20} />
                    </button>
                </div>

                <div className="bg-surface/50 rounded-xl p-4 mb-6 border border-border/50 text-center">
                    <p className="text-sm text-text-muted mb-1">Current Time</p>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-text-main to-text-muted bg-clip-text text-transparent">
                        {formatTime(currentTime)}
                    </h2>
                </div>

                <div className="flex items-center justify-center mb-6">
                    <button
                        onClick={handlePunch}
                        disabled={loading}
                        className={`
                            relative w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300
                            ${status.isPunchedIn
                                ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'border-green-500 bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            }
                        `}
                    >
                        {loading ? (
                            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="text-xs font-semibold uppercase tracking-wider mb-1">
                                    {status.isPunchedIn ? 'Punch Out' : 'Punch In'}
                                </span>
                                <Coffee size={24} />
                            </>
                        )}
                    </button>
                </div>

                {status.isPunchedIn && (
                    <div className="text-center animate-fadeIn">
                        <p className="text-xs text-text-muted">Punched In at</p>
                        <p className="text-sm font-semibold text-text-main">
                            {new Date(status.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                        <p className="text-xs text-text-muted mb-1">Break Time</p>
                        <p className="font-semibold text-text-main">1.2 hrs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-text-muted mb-1">Overtime</p>
                        <p className="font-semibold text-text-main">3 hrs</p>
                    </div>
                </div>

                {/* View History Link */}
                <button
                    onClick={() => setShowHistory(true)}
                    className="w-full mt-4 pt-4 border-t border-border text-center text-xs text-primary-400 hover:text-primary-300 flex items-center justify-center gap-1 transition-colors"
                >
                    <History size={14} />
                    View Full History
                </button>
            </div>

            {/* History Modal */}
            <TimesheetHistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </>
    );
};

export default AttendanceCard;
