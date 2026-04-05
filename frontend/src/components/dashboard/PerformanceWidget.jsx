import { TrendingUp, FileText, Users, Calendar, Plus, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PerformanceWidget = () => {
    const navigate = useNavigate();

    // Mock data for the performance chart
    const data = [45, 52, 38, 65, 48, 72, 85];
    const maxVal = Math.max(...data);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / maxVal) * 80; // keep some padding at top
        return `${x},${y}`;
    }).join(' ');

    const endY = 100 - (data[data.length - 1] / maxVal) * 80;

    const quickActions = [
        { icon: Plus, label: 'New Task', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', action: () => navigate('/tasks') },
        { icon: Users, label: 'Team', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', action: () => navigate('/team') },
        { icon: FileText, label: 'Reports', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', action: () => navigate('/reports') },
        { icon: Calendar, label: 'Schedule', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', action: () => { } },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <div className="card glass p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                            <TrendingUp className="text-primary-500" size={20} />
                            Performance Overview
                        </h3>
                        <p className="text-sm text-text-muted">Weekly productivity metrics</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm border border-green-500/20">
                        <TrendingUp size={14} />
                        <span>+12.5%</span>
                    </div>
                </div>

                <div className="relative h-48 w-full mt-4">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-text-muted">
                        <div className="border-b border-border/50 w-full h-0"></div>
                        <div className="border-b border-border/50 w-full h-0"></div>
                        <div className="border-b border-border/50 w-full h-0"></div>
                        <div className="border-b border-border/50 w-full h-0"></div>
                        <div className="border-b border-border/50 w-full h-0"></div>
                    </div>

                    {/* Chart */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M0,100 L0,${100 - (data[0] / maxVal) * 80} ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`}
                            fill="url(#gradient)"
                        />
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-lg"
                        />
                        {/* Data points */}
                        {points.split(' ').map((p, i) => {
                            const [cx, cy] = p.split(',');
                            return (
                                <circle
                                    key={i}
                                    cx={cx}
                                    cy={cy}
                                    r="1.5"
                                    className="fill-background stroke-primary-400 stroke-2 hover:r-2 transition-all cursor-pointer"
                                >
                                    <title>Task Count: {data[i]}</title>
                                </circle>
                            );
                        })}
                    </svg>

                    {/* X Axis Labels */}
                    <div className="absolute -bottom-6 inset-x-0 flex justify-between text-xs text-text-muted mt-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Goals */}
            <div className="space-y-6">
                {/* Goal Progress */}
                <div className="card glass p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-text-main flex items-center gap-2">
                            <Target className="text-purple-400" size={18} /> Daily Goal
                        </h4>
                        <span className="text-xs text-text-muted">8/10 Tasks</span>
                    </div>
                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.86" strokeDashoffset="70" className="text-purple-500" strokeLinecap="round" />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-2xl font-bold text-text-main">80%</span>
                        </div>
                    </div>
                    <p className="text-center text-xs text-text-muted mt-2">Keep it up! almost there.</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="card glass p-5">
                    <h4 className="font-semibold text-text-main mb-4 text-sm">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((item, i) => (
                            <button
                                key={i}
                                onClick={item.action}
                                className={`p-3 rounded-xl border ${item.border} ${item.bg} hover:brightness-110 transition-all flex flex-col items-center justify-center gap-2 group`}
                            >
                                <item.icon size={20} className={item.color} />
                                <span className={`text-xs font-medium text-text-muted group-hover:text-text-main transition-colors`}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceWidget;
