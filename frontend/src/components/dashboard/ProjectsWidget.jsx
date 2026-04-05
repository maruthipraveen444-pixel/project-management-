import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, MoreVertical, Clock, CheckCircle, AlertTriangle, Layers, ArrowUpRight } from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

const getProjectStatus = (project) => {
    const progress = project.progress || 0;
    const endDate  = project.endDate ? new Date(project.endDate) : null;
    const now      = new Date();
    if (progress >= 100)                               return { label:'Completed', grad:'linear-gradient(135deg,#34d399,#06b6d4)', glow:'rgba(52,211,153,0.5)',  icon: CheckCircle  };
    if (endDate && endDate < now && progress < 100)    return { label:'Delayed',   grad:'linear-gradient(135deg,#fb7185,#f43f5e)', glow:'rgba(251,113,133,0.5)', icon: AlertTriangle };
    return                                                    { label:'On Track',  grad:'linear-gradient(135deg,#5b9cf6,#a78bfa)', glow:'rgba(91,156,246,0.5)',  icon: Clock         };
};

const getProgressGrad = (p) => {
    if (p >= 100) return 'linear-gradient(90deg,#34d399,#06b6d4)';
    if (p >= 70)  return 'linear-gradient(90deg,#5b9cf6,#a78bfa)';
    if (p >= 40)  return 'linear-gradient(90deg,#fbbf24,#f97316)';
    return             'linear-gradient(90deg,#fb7185,#f43f5e)';
};

const ProjectsWidget = ({ projects = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="card glass glass-edge">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="icon-box w-9 h-9"
                         style={{
                             background: 'linear-gradient(135deg,#5b9cf6,#a78bfa)',
                             border: '1px solid rgba(255,255,255,0.2)',
                             boxShadow: '0 4px 16px rgba(91,156,246,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                         }}>
                        <Layers size={16} className="text-white relative z-10" />
                    </div>
                    <div>
                        <h3 className="section-title">Active Projects</h3>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {projects.length} project{projects.length !== 1 ? 's' : ''} tracked
                        </p>
                    </div>
                </div>
                <Link to="/projects"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200"
                      style={{ color: '#5b9cf6', background: 'rgba(91,156,246,0.08)', border: '1px solid rgba(91,156,246,0.2)' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.16)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(91,156,246,0.08)'; }}>
                    View All <ChevronRight size={12}/>
                </Link>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {projects.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Layers size={24} style={{ color: 'rgba(255,255,255,0.25)' }}/>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No active projects</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Projects will appear here once created</p>
                    </div>
                ) : (
                    projects.map((project, index) => {
                        const status = getProjectStatus(project);
                        const StatusIcon = status.icon;
                        const initials = project.name.charAt(0).toUpperCase();

                        return (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/projects/${project._id}`)}
                                className="animate-fadeIn group relative overflow-hidden rounded-[16px] cursor-pointer transition-all duration-300 p-4"
                                style={{
                                    animationDelay: `${index * 70}ms`,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(91,156,246,0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(91,156,246,0.25)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.4), 0 0 20px rgba(91,156,246,0.08)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                                    e.currentTarget.style.transform = '';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                {/* Top bevel */}
                                <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                                     style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)' }}/>

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {/* Project avatar */}
                                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold text-sm relative overflow-hidden flex-shrink-0"
                                             style={{
                                                 background: project.color
                                                     ? `linear-gradient(135deg, ${project.color}cc, ${project.color}88)`
                                                     : 'linear-gradient(135deg,#5b9cf6,#a78bfa)',
                                                 border: '1px solid rgba(255,255,255,0.2)',
                                                 boxShadow: project.color
                                                     ? `0 4px 16px ${project.color}55`
                                                     : '0 4px 16px rgba(91,156,246,0.35)',
                                             }}>
                                            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[12px]"
                                                 style={{ background: 'rgba(255,255,255,0.2)' }}/>
                                            <span className="relative z-10">{initials}</span>
                                        </div>

                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                {project.name}
                                            </h4>
                                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                {project.totalTasks} tasks · {project.teamMembers?.length || 0} members
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Status badge */}
                                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                              style={{
                                                  background: `${status.glow.slice(0,-1)}22)`,
                                                  color: status.glow,
                                                  border: `1px solid ${status.glow.slice(0,-1)}44)`,
                                              }}>
                                            <StatusIcon size={9} />
                                            {status.label}
                                        </span>

                                        <button onClick={e => e.stopPropagation()}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)' }}>
                                            <MoreVertical size={13}/>
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-[10px] mb-1.5">
                                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Progress</span>
                                        <span className="font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{project.progress}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                        <div className="h-full rounded-full transition-all duration-1000 ease-out animate-progressBar relative"
                                             style={{
                                                 background: getProgressGrad(project.progress),
                                                 width: `${project.progress}%`,
                                                 '--progress-width': `${project.progress}%`,
                                                 boxShadow: `0 0 10px ${status.glow}`,
                                             }}>
                                            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-full"
                                                 style={{ background: 'rgba(255,255,255,0.4)' }}/>
                                        </div>
                                    </div>
                                </div>

                                {/* Team avatars */}
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-1.5">
                                        {project.teamMembers?.slice(0, 5).map((member, i) => (
                                            <UserAvatar
                                                key={i}
                                                user={member.user}
                                                size="sm"
                                                showBadge={false}
                                                showTooltip={true}
                                                className="ring-2 transition-all hover:z-10 hover:scale-110"
                                                style={{ ringColor: '#03060f' }}
                                            />
                                        ))}
                                        {(project.teamMembers?.length > 5) && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                 style={{
                                                     background: 'rgba(91,156,246,0.2)',
                                                     border: '2px solid #03060f',
                                                     color: '#93c5fd',
                                                 }}>
                                                +{project.teamMembers.length - 5}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow icon */}
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                         style={{ background: 'rgba(91,156,246,0.15)', color: '#5b9cf6' }}>
                                        <ArrowUpRight size={12}/>
                                    </div>
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
