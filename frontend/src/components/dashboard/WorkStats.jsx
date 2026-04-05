import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, AlertTriangle, Users, FolderOpen } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay, onClick }) => (
    <div
        onClick={onClick}
        className={`card glass p-4 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div>
            <p className="text-text-muted text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-text-main mb-1">{value}</h3>
            <p className={`text-xs ${color.text} flex items-center gap-1`}>
                {subtitle}
            </p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={color.text} size={24} />
        </div>
    </div>
);

const WorkStats = ({ stats, role }) => {
    const navigate = useNavigate();
    const isAdmin = ['Super Admin', 'Project Admin'].includes(role);
    const isManager = ['Project Manager', 'Team Lead'].includes(role);

    let cards = [];

    if (isAdmin) {
        cards = [
            {
                title: 'Total Projects',
                value: stats?.totalProjects || 0,
                subtitle: '12 added this month',
                icon: Briefcase,
                color: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                onClick: () => navigate('/projects')
            },
            {
                title: 'Active Projects',
                value: stats?.activeProjects || 0,
                subtitle: 'Currently running',
                icon: Clock,
                color: { bg: 'bg-green-500/20', text: 'text-green-400' },
                onClick: () => navigate('/projects?status=In Progress')
            },
            {
                title: 'Total Employees',
                value: stats?.totalUsers || 0,
                subtitle: 'Across all depts',
                icon: Users,
                color: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                onClick: () => navigate('/team')
            },
            {
                title: 'Completed',
                value: stats?.completedProjects || 0,
                subtitle: 'Successfully delivered',
                icon: CheckCircle,
                color: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
                onClick: () => navigate('/projects?status=Completed')
            }
        ];
    } else if (isManager) {
        cards = [
            {
                title: 'Managed Projects',
                value: stats?.managedProjects?.length || 0,
                subtitle: 'Under your lead',
                icon: Briefcase,
                color: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                onClick: () => navigate('/projects')
            },
            {
                title: 'Overdue Tasks',
                value: stats?.overdueTasks || 0,
                subtitle: 'Needs attention',
                icon: AlertTriangle,
                color: { bg: 'bg-red-500/20', text: 'text-red-400' },
                onClick: () => navigate('/tasks?filter=overdue')
            },
            {
                title: 'Team Members',
                value: stats?.teamSize || 0,
                subtitle: 'In your team',
                icon: Users,
                color: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                onClick: () => navigate('/team')
            },
            {
                title: 'Tasks In Progress',
                value: stats?.inProgressTasks || 0,
                subtitle: 'Being worked on',
                icon: Clock,
                color: { bg: 'bg-green-500/20', text: 'text-green-400' },
                onClick: () => navigate('/tasks')
            }
        ];
    } else {
        // Regular employee stats
        cards = [
            {
                title: 'Pending Tasks',
                value: stats?.pendingTasks || 0,
                subtitle: 'Assigned to you',
                icon: FolderOpen,
                color: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
                onClick: () => navigate('/tasks')
            },
            {
                title: 'Hours Today',
                value: parseFloat(stats?.hoursToday || 0).toFixed(1),
                subtitle: 'Recorded time',
                icon: Clock,
                color: { bg: 'bg-green-500/20', text: 'text-green-400' },
                onClick: () => navigate('/reports?tab=timesheet')
            },
            {
                title: 'Hours This Week',
                value: parseFloat(stats?.hoursThisWeek || 0).toFixed(1),
                subtitle: 'Total verified',
                icon: CheckCircle,
                color: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
                onClick: () => navigate('/reports?tab=timesheet')
            },
            {
                title: 'Leave Balance',
                value: '14 Days',
                subtitle: 'Available',
                icon: CheckCircle,
                color: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
                onClick: () => navigate('/reports?tab=leave')
            }
        ];
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <StatCard key={index} {...card} delay={index * 100} />
            ))}
        </div>
    );
};

export default WorkStats;
