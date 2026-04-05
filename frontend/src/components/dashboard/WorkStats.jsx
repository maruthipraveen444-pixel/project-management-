import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, AlertTriangle, Users, FolderOpen, TrendingUp, ArrowUpRight } from 'lucide-react';

/* ── Gradient presets for each card ── */
const GRADIENTS = [
    { grad: 'linear-gradient(135deg,#3b82f6 0%,#5b9cf6 100%)', glow: 'rgba(59,130,246,0.45)', soft: 'rgba(59,130,246,0.14)', text: '#93c5fd' },
    { grad: 'linear-gradient(135deg,#34d399 0%,#06b6d4 100%)', glow: 'rgba(52,211,153,0.45)', soft: 'rgba(52,211,153,0.14)', text: '#6ee7b7' },
    { grad: 'linear-gradient(135deg,#a78bfa 0%,#ec4899 100%)', glow: 'rgba(167,139,250,0.45)', soft: 'rgba(167,139,250,0.14)', text: '#c4b5fd' },
    { grad: 'linear-gradient(135deg,#fbbf24 0%,#f97316 100%)', glow: 'rgba(251,191,36,0.45)', soft: 'rgba(251,191,36,0.14)', text: '#fde68a' },
];

const StatCard = ({ title, value, subtitle, icon: Icon, colorIndex = 0, delay = 0, onClick }) => {
    const g = GRADIENTS[colorIndex % GRADIENTS.length];

    return (
        <div
            onClick={onClick}
            className="stat-card animate-fadeIn"
            style={{
                animationDelay: `${delay}ms`,
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            {/* ── Corner glow ── */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                 style={{ background: g.soft, filter: 'blur(20px)' }} />

            {/* ── Content ── */}
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                       style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em' }}>
                        {title}
                    </p>
                    <p className="num-display mb-1.5" style={{ color: 'var(--text-primary)' }}>
                        {value}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={11} style={{ color: g.text, flexShrink: 0 }} />
                        <p className="text-[11px] font-medium truncate" style={{ color: g.text }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* ── Icon box ── */}
                <div className="icon-box flex-shrink-0"
                     style={{
                         background: g.grad,
                         border: '1px solid rgba(255,255,255,0.22)',
                         boxShadow: `0 6px 20px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                     }}>
                    <Icon size={20} className="text-white relative z-10" />
                </div>
            </div>

            {/* ── Thin bottom bar (accent) ── */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[20px] pointer-events-none"
                 style={{ background: g.grad, opacity: 0.6 }} />

            {/* ── Arrow chip (if clickable) ── */}
            {onClick && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                     style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <ArrowUpRight size={10} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </div>
            )}
        </div>
    );
};

const WorkStats = ({ stats, role }) => {
    const navigate = useNavigate();
    const isAdmin   = ['Super Admin', 'Project Admin'].includes(role);
    const isManager = ['Project Manager', 'Team Lead'].includes(role);

    let cards = [];

    if (isAdmin) {
        cards = [
            { title: 'Total Projects',    value: stats?.totalProjects     || 0,           subtitle: 'All time',            icon: Briefcase,     colorIndex: 0, onClick: () => navigate('/projects')                      },
            { title: 'Active Projects',   value: stats?.activeProjects    || 0,           subtitle: 'Currently running',   icon: Clock,         colorIndex: 1, onClick: () => navigate('/projects?status=In Progress')   },
            { title: 'Total Employees',   value: stats?.totalUsers        || 0,           subtitle: 'Across all depts',    icon: Users,         colorIndex: 2, onClick: () => navigate('/team')                          },
            { title: 'Completed',         value: stats?.completedProjects || 0,           subtitle: 'Successfully delivered', icon: CheckCircle, colorIndex: 3, onClick: () => navigate('/projects?status=Completed')  },
        ];
    } else if (isManager) {
        cards = [
            { title: 'Managed Projects',  value: stats?.managedProjects?.length || 0, subtitle: 'Under your lead',    icon: Briefcase,     colorIndex: 0, onClick: () => navigate('/projects')                   },
            { title: 'Overdue Tasks',     value: stats?.overdueTasks  || 0,          subtitle: 'Needs attention',     icon: AlertTriangle, colorIndex: 3, onClick: () => navigate('/tasks?filter=overdue')        },
            { title: 'Team Members',      value: stats?.teamSize      || 0,          subtitle: 'In your team',        icon: Users,         colorIndex: 2, onClick: () => navigate('/team')                        },
            { title: 'Tasks In Progress', value: stats?.inProgressTasks || 0,        subtitle: 'Being worked on',     icon: Clock,         colorIndex: 1, onClick: () => navigate('/tasks')                       },
        ];
    } else {
        cards = [
            { title: 'Pending Tasks',     value: stats?.pendingTasks  || 0,                       subtitle: 'Assigned to you',  icon: FolderOpen,  colorIndex: 0, onClick: () => navigate('/tasks')                       },
            { title: 'Hours Today',       value: parseFloat(stats?.hoursToday     || 0).toFixed(1), subtitle: 'Recorded time',  icon: Clock,       colorIndex: 1, onClick: () => navigate('/reports?tab=timesheet')       },
            { title: 'Hours This Week',   value: parseFloat(stats?.hoursThisWeek  || 0).toFixed(1), subtitle: 'Total verified', icon: CheckCircle, colorIndex: 2, onClick: () => navigate('/reports?tab=timesheet')       },
            { title: 'Leave Balance',     value: '14 Days',                                         subtitle: 'Available',      icon: CheckCircle, colorIndex: 3, onClick: () => navigate('/reports?tab=leave')           },
        ];
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <StatCard key={index} {...card} delay={index * 80} />
            ))}
        </div>
    );
};

export default WorkStats;
