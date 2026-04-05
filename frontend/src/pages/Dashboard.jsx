import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import WorkStats from '../components/dashboard/WorkStats';
import AttendanceCard from '../components/dashboard/AttendanceCard';
import ProjectsWidget from '../components/dashboard/ProjectsWidget';
import LeaveDetails from '../components/dashboard/LeaveDetails';
import PerformanceWidget from '../components/dashboard/PerformanceWidget';
import IssueStats from '../components/dashboard/IssueStats';

// Dynamic greeting based on current hour
const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '☀️' };
    } else if (hour >= 12 && hour < 18) {
        return { text: 'Good Afternoon', emoji: '🌤️' };
    } else if (hour >= 18 && hour < 22) {
        return { text: 'Good Evening', emoji: '🌙' };
    } else {
        return { text: 'Good Night', emoji: '✨' };
    }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState(getGreeting());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: response } = await api.get('/dashboard');
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-surface rounded-xl"></div>
                ))}
                <div className="col-span-2 h-96 bg-surface rounded-xl"></div>
                <div className="h-96 bg-surface rounded-xl"></div>
            </div>
        );
    }

    // Determine stats to show based on data availability
    const stats = data.adminStats || data.managerStats || {
        hoursToday: data.workStats?.hoursToday,
        hoursThisWeek: data.workStats?.hoursThisWeek,
        pendingTasks: data.myTasks?.length || 0
    };

    // Role matching the matrix: Only Admin and PM can create projects
    const canCreateProject = ['Super Admin', 'Project Admin', 'Project Manager'].includes(data?.user?.role);


    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-main mb-1">
                        {greeting.text}, {data.user.name.split(' ')[0]}! {greeting.emoji}
                    </h1>
                    <p className="text-text-muted">Here's what's happening with your projects today.</p>
                </div>
                {canCreateProject && (
                    <button
                        onClick={() => navigate('/projects', { state: { openCreateModal: true } })}
                        className="btn-primary"
                    >
                        + New Project
                    </button>
                )}
            </div>

            {/* Top Stats Cards */}
            <WorkStats stats={stats} role={data.user.role} />

            {/* Issue Stats - Only for Admin, PM, Team Lead */}
            {['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(data.user.role) && (
                <IssueStats />
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Left Column - Projects & Feed */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <ProjectsWidget projects={data.adminStats?.allProjects || data.userProjects} />
                    </div>

                    {/* Performance & Quick Actions */}
                    <PerformanceWidget />
                </div>

                {/* Right Column - Attendance & Details */}
                <div className="xl:col-span-1 space-y-6">
                    <AttendanceCard attendance={data.attendance} user={data.user} />
                    <LeaveDetails />
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
