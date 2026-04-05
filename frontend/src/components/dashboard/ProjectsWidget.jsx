import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, MoreVertical, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';


// Calculate project status based on progress and deadline
const getProjectStatus = (project) => {
    const progress = project.progress || 0;
    const endDate = project.endDate ? new Date(project.endDate) : null;
    const now = new Date();

    if (progress >= 100) {
        return { label: 'Completed', color: 'bg-green-500', textColor: 'text-green-400', icon: CheckCircle };
    }

    if (endDate && endDate < now && progress < 100) {
        return { label: 'Delayed', color: 'bg-red-500', textColor: 'text-red-400', icon: AlertTriangle };
    }

    return { label: 'On Track', color: 'bg-blue-500', textColor: 'text-blue-400', icon: Clock };
};

// Get progress bar color based on progress value
const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
};

const ProjectsWidget = ({ projects = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="card glass col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-main">Active Projects</h3>
                <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {projects.length === 0 ? (
                    <p className="text-text-muted text-center py-4">No active projects found.</p>
                ) : (
                    projects.map((project, index) => {
                        const status = getProjectStatus(project);
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/projects/${project._id}`)}
                                className="p-4 rounded-xl bg-surface/50 border border-border hover:border-primary-500/50 hover:bg-surface transition-all cursor-pointer animate-fadeIn"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: project.color || '#3b82f6' }}
                                        >
                                            {project.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-text-main">{project.name}</h4>
                                                {/* Status Badge */}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${status.color}/20 ${status.textColor}`}>
                                                    <StatusIcon size={10} />
                                                    {status.label}
                                                </span>
                                                {project.currentMilestone && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-500/10 text-primary-400 border border-primary-500/10">
                                                        {project.currentMilestone}
                                                    </span>
                                                )}

                                            </div>
                                            <p className="text-xs text-text-muted">{project.totalTasks} Tasks • {project.teamMembers?.length || 0} Members</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-text-muted hover:text-text-main"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                {/* Animated Progress Section */}
                                <div
                                    className="space-y-2 p-2 -m-2 rounded-lg hover:bg-primary-500/10 transition-colors"
                                    title="Click to view project tasks"
                                >
                                    <div className="flex justify-between text-xs">
                                        <span className="text-text-muted">Progress</span>
                                        <span className="text-text-main font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`${getProgressColor(project.progress)} h-1.5 rounded-full transition-all duration-1000 ease-out animate-progressBar`}
                                            style={{
                                                '--progress-width': `${project.progress}%`,
                                                width: `${project.progress}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Team Avatars - Clickable */}
                                <div
                                    className="mt-4 flex -space-x-1.5 cursor-pointer group"
                                    onClick={(e) => { e.stopPropagation(); navigate('/team'); }}
                                    title="View Team Members"
                                >
                                    {project.teamMembers?.slice(0, 4).map((member, i) => (
                                        <UserAvatar
                                            key={i}
                                            user={member.user}
                                            size="sm"
                                            showBadge={false}
                                            showTooltip={true}
                                            className="ring-2 ring-dark-800 hover:ring-primary-500 hover:z-10 transition-all"
                                        />
                                    ))}

                                    {(project.teamMembers?.length > 4) && (
                                        <div className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-surface to-background flex items-center justify-center text-[10px] text-text-main font-medium group-hover:border-primary-500 group-hover:from-primary-600 group-hover:to-primary-700 transition-all">
                                            +{project.teamMembers.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProjectsWidget;
