import { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, Users, MessageSquare, Send,
    AlertCircle, Loader, Tag, FolderOpen, ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import UserAvatar from './common/UserAvatar';
import RoleIcon from './common/RoleIcon';

/* ── Priority & Status config ─────────────────────────── */
const PRIORITY = {
    Critical: { bg:'rgba(167,139,250,0.12)', color:'#c4b5fd', border:'rgba(167,139,250,0.35)', glow:'rgba(167,139,250,0.4)' },
    High:     { bg:'rgba(251,113,133,0.12)', color:'#fda4af', border:'rgba(251,113,133,0.35)', glow:'rgba(251,113,133,0.4)' },
    Medium:   { bg:'rgba(251,191,36,0.12)',  color:'#fde68a', border:'rgba(251,191,36,0.35)',  glow:'rgba(251,191,36,0.4)'  },
    Low:      { bg:'rgba(52,211,153,0.12)',  color:'#6ee7b7', border:'rgba(52,211,153,0.35)',  glow:'rgba(52,211,153,0.4)'  },
};

const STATUS = {
    'Open':        { bg:'rgba(148,163,184,0.12)', color:'#cbd5e1', border:'rgba(148,163,184,0.3)' },
    'To Do':       { bg:'rgba(91,156,246,0.12)',  color:'#93c5fd', border:'rgba(91,156,246,0.3)'  },
    'In Progress': { bg:'rgba(251,191,36,0.12)',  color:'#fde68a', border:'rgba(251,191,36,0.3)'  },
    'In Review':   { bg:'rgba(167,139,250,0.12)', color:'#c4b5fd', border:'rgba(167,139,250,0.3)' },
    'Completed':   { bg:'rgba(52,211,153,0.12)',  color:'#6ee7b7', border:'rgba(52,211,153,0.3)'  },
    'Blocked':     { bg:'rgba(251,113,133,0.12)', color:'#fda4af', border:'rgba(251,113,133,0.3)' },
};

const formatDate  = d => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : 'Not set';
const timeAgo     = d => {
    if (!d) return '';
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), day = Math.floor(diff/86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${day}d ago`;
};

/* ── Shared inline select style (dark glass) ─────────── */
const selectSt = {
    width: '100%',
    padding: '0.6rem 2rem 0.6rem 0.875rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    appearance: 'none',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c8db5' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.625rem center',
};

/* ═══════════════════════════════════════════════════════
   TASK DETAILS DRAWER
   ═══════════════════════════════════════════════════════ */

const TaskDetailsDrawer = ({ isOpen, onClose, task, onTaskUpdated, userRole, canEdit = true, teamMembers = [] }) => {
    const [loading, setLoading]               = useState(false);
    const [taskData, setTaskData]             = useState(null);
    const [newComment, setNewComment]         = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const canEditTask    = canEdit && ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(userRole);
    const canChangeStatus = canEdit;

    useEffect(() => {
        if (isOpen && task) fetchTaskDetails();
    }, [isOpen, task?._id]);

    const fetchTaskDetails = async () => {
        if (!task?._id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/tasks/${task._id}`);
            if (data.success) setTaskData(data.data);
        } catch {
            setTaskData(task);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange   = async v => { try { await api.put(`/tasks/${task._id}`, { status: v }); setTaskData(p => ({...p, status: v})); onTaskUpdated?.(); } catch {} };
    const handlePriorityChange = async v => { try { await api.put(`/tasks/${task._id}`, { priority: v }); setTaskData(p => ({...p, priority: v})); onTaskUpdated?.(); } catch {} };

    const handleAddMember = async (e) => {
        const memberId = e.target.value;
        if (!memberId || !taskData) return;
        const currentAssignees = taskData.assignedTo?.map(u => u._id) || [];
        if (currentAssignees.includes(memberId)) return;
        
        const newAssignees = [...currentAssignees, memberId];
        try {
            await api.put(`/tasks/${task._id}`, { assignedTo: newAssignees });
            const addedMember = teamMembers.find(m => m._id === memberId) || { _id: memberId, name: 'Loading...' };
            setTaskData(p => ({ ...p, assignedTo: [...(p.assignedTo||[]), addedMember] }));
            onTaskUpdated?.();
        } catch {}
    };

    const handleRemoveMember = async (memberId) => {
        if (!taskData) return;
        const newAssignees = taskData.assignedTo?.filter(u => u._id !== memberId).map(u => u._id) || [];
        try {
            await api.put(`/tasks/${task._id}`, { assignedTo: newAssignees });
            setTaskData(p => ({ ...p, assignedTo: p.assignedTo.filter(u => u._id !== memberId) }));
            onTaskUpdated?.();
        } catch {}
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            const { data } = await api.post(`/tasks/${task._id}/comments`, { text: newComment });
            if (data.success) { setTaskData(p => ({ ...p, comments: [...(p.comments||[]), data.data] })); setNewComment(''); }
        } catch {}
        finally { setSubmittingComment(false); }
    };

    const isOverdue = taskData?.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'Completed';
    const p = PRIORITY[taskData?.priority] || PRIORITY.Medium;
    const s = STATUS[taskData?.status]     || STATUS['Open'];

    if (!isOpen) return null;

    /* ── style tokens ── */
    const drawerBg = {
        background: 'rgba(5,10,24,0.97)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '-24px 0 80px rgba(0,0,0,0.7)',
    };

    const sectionBorder = { borderBottom: '1px solid rgba(255,255,255,0.06)' };
    const labelSt = { fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.38)', marginBottom:'0.5rem', display:'block' };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 transition-opacity"
                 style={{ background:'rgba(3,6,15,0.75)', backdropFilter:'blur(12px)' }}
                 onClick={onClose} />

            {/* Drawer panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[520px] z-50 drawer-slide-in flex flex-col overflow-hidden"
                 style={drawerBg}>

                {/* Top bevel */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                     style={{ background:'linear-gradient(90deg,transparent,rgba(91,156,246,0.4),rgba(167,139,250,0.35),transparent)' }} />

                {/* ── Header ── */}
                <div className="flex justify-between items-start px-6 py-5 flex-shrink-0" style={sectionBorder}>
                    <div className="flex-1 pr-4 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                                  style={{ background:p.bg, color:p.color, border:`1px solid ${p.border}`, boxShadow:`0 0 10px ${p.glow.replace('0.4','0.2')}` }}>
                                {taskData?.priority || 'Medium'}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                                  style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                {taskData?.status || 'Open'}
                            </span>
                            {isOverdue && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                                      style={{ background:'rgba(251,113,133,0.12)', color:'#fda4af', border:'1px solid rgba(251,113,133,0.3)' }}>
                                    <AlertCircle size={9} /> Overdue
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold leading-snug" style={{ color:'var(--text-primary)' }}>
                            {loading ? 'Loading…' : (taskData?.title || task?.title)}
                        </h2>
                    </div>
                    <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
                            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.45)' }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(251,113,133,0.12)'; e.currentTarget.style.color='#fda4af'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                        <X size={16} />
                    </button>
                </div>

                {/* ── Body ── */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 rounded-full animate-spin"
                             style={{ borderColor:'rgba(91,156,246,0.25)', borderTopColor:'#5b9cf6' }} />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">

                        {/* Description */}
                        <div className="px-6 py-5" style={sectionBorder}>
                            <span style={labelSt}>Description</span>
                            <p className="text-sm leading-relaxed" style={{ color: taskData?.description ? 'var(--text-primary)' : 'rgba(255,255,255,0.3)' }}>
                                {taskData?.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Status & Priority */}
                        <div className="px-6 py-5" style={sectionBorder}>
                            <span style={labelSt}>Status & Priority</span>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Status */}
                                <div>
                                    <p className="text-[10px] mb-1.5 font-semibold uppercase tracking-widest"
                                       style={{ color:'rgba(255,255,255,0.28)' }}>Status</p>
                                    {canChangeStatus ? (
                                        <div className="relative">
                                            <select
                                                value={taskData?.status || 'Open'}
                                                onChange={e => handleStatusChange(e.target.value)}
                                                style={selectSt}
                                                onFocus={e => { e.target.style.borderColor='rgba(91,156,246,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)'; }}
                                                onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow=''; }}
                                            >
                                                {Object.keys(STATUS).map(st => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <span className="inline-flex text-xs px-2.5 py-1 rounded-full font-semibold"
                                              style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                            {taskData?.status}
                                        </span>
                                    )}
                                </div>

                                {/* Priority */}
                                <div>
                                    <p className="text-[10px] mb-1.5 font-semibold uppercase tracking-widest"
                                       style={{ color:'rgba(255,255,255,0.28)' }}>Priority</p>
                                    {canEditTask ? (
                                        <div className="relative">
                                            <select
                                                value={taskData?.priority || 'Medium'}
                                                onChange={e => handlePriorityChange(e.target.value)}
                                                style={selectSt}
                                                onFocus={e => { e.target.style.borderColor='rgba(91,156,246,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)'; }}
                                                onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow=''; }}
                                            >
                                                {Object.keys(PRIORITY).map(pr => <option key={pr} value={pr}>{pr}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <span className="inline-flex text-xs px-2.5 py-1 rounded-full font-semibold"
                                              style={{ background:p.bg, color:p.color, border:`1px solid ${p.border}` }}>
                                            {taskData?.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Meta info */}
                        <div className="px-6 py-5" style={sectionBorder}>
                            <span style={labelSt}>Details</span>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                         style={{ background:'rgba(91,156,246,0.12)', border:'1px solid rgba(91,156,246,0.2)' }}>
                                        <Calendar size={13} style={{ color:'#5b9cf6' }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>Due Date</p>
                                        <p className="text-sm font-medium" style={{ color: isOverdue ? '#fda4af' : 'var(--text-primary)' }}>
                                            {formatDate(taskData?.dueDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                         style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.2)' }}>
                                        <Clock size={13} style={{ color:'#34d399' }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>Time</p>
                                        <p className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>
                                            {taskData?.timeSpent || 0}h / {taskData?.estimatedHours || 0}h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned members */}
                        <div className="px-6 py-5" style={sectionBorder}>
                            <div className="flex items-center justify-between mb-2">
                                <span style={labelSt}>Assigned Members</span>
                                {canEditTask && teamMembers.length > 0 && (
                                    <select
                                        onChange={handleAddMember}
                                        value=""
                                        className="text-xs px-2 py-1 rounded-lg outline-none cursor-pointer"
                                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#5b9cf6' }}
                                    >
                                        <option value="" disabled>+ Add Member</option>
                                        {teamMembers
                                            .filter(m => !(taskData?.assignedTo?.some(assigned => assigned._id === m._id)))
                                            .map(m => <option key={m._id} value={m._id} style={{ color: '#000' }}>{m.name}</option>)
                                        }
                                    </select>
                                )}
                            </div>
                            
                            {taskData?.assignedTo?.length > 0 ? (
                                <div className="space-y-2 mt-2">
                                    {taskData.assignedTo.map((u, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all group"
                                             style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
                                             onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                             onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                            <UserAvatar user={u} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color:'var(--text-primary)' }}>{u.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <RoleIcon role={u.role} size={10} />
                                                    <span className="text-[10px]" style={{ color:'var(--text-secondary)' }}>{u.role}</span>
                                                </div>
                                            </div>
                                            {canEditTask && (
                                                <button
                                                    onClick={() => handleRemoveMember(u._id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                    style={{ color: 'rgba(251,113,133,0.7)', background: 'rgba(251,113,133,0.1)' }}
                                                    onMouseEnter={e => e.currentTarget.style.color='#fda4af'}
                                                    onMouseLeave={e => e.currentTarget.style.color='rgba(251,113,133,0.7)'}
                                                    title="Remove Member"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center mt-2">
                                    <Users size={22} className="mx-auto mb-2" style={{ color:'rgba(255,255,255,0.2)' }} />
                                    <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>No members assigned</p>
                                </div>
                            )}
                        </div>

                        {/* Project info */}
                        {taskData?.project && (
                            <div className="px-6 py-4" style={sectionBorder}>
                                <span style={labelSt}>Project</span>
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px]"
                                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                         style={{ background: taskData.project.color ? `${taskData.project.color}33` : 'rgba(91,156,246,0.15)', border:`1px solid ${taskData.project.color || '#5b9cf6'}44` }}>
                                        <FolderOpen size={13} style={{ color: taskData.project.color || '#5b9cf6' }} />
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color:'var(--text-primary)' }}>{taskData.project.name}</span>
                                </div>
                            </div>
                        )}

                        {/* ── Comments ── */}
                        <div className="px-6 py-5">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare size={14} style={{ color:'#5b9cf6' }} />
                                <span className="text-sm font-bold" style={{ color:'var(--text-primary)' }}>
                                    Comments
                                </span>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                      style={{ background:'rgba(91,156,246,0.12)', color:'#93c5fd', border:'1px solid rgba(91,156,246,0.25)' }}>
                                    {taskData?.comments?.length || 0}
                                </span>
                            </div>

                            {/* Comment list */}
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
                                {taskData?.comments?.length > 0 ? taskData.comments.map((c, i) => (
                                    <div key={i} className="flex gap-3 p-3 rounded-[12px]"
                                         style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                        <UserAvatar user={c.user} size="sm" showBadge={false} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <RoleIcon role={c.user?.role} size={11} />
                                                    <span className="text-xs font-bold" style={{ color:'var(--text-primary)' }}>{c.user?.name || 'Unknown'}</span>
                                                </div>
                                                <span className="text-[10px] ml-auto" style={{ color:'rgba(255,255,255,0.28)' }}>{timeAgo(c.createdAt)}</span>
                                            </div>
                                            <p className="text-xs leading-relaxed" style={{ color:'var(--text-secondary)' }}>{c.text}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-6 text-center">
                                        <MessageSquare size={20} className="mx-auto mb-2" style={{ color:'rgba(255,255,255,0.2)' }} />
                                        <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>No comments yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Add comment */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Write a comment…"
                                    className="flex-1 text-sm"
                                    style={{
                                        padding: '0.7rem 1rem',
                                        borderRadius: 12,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.10)',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onFocus={e => { e.target.style.borderColor='rgba(91,156,246,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)'; }}
                                    onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.10)'; e.target.style.boxShadow=''; }}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || submittingComment}
                                    className="btn-primary px-4 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submittingComment
                                        ? <Loader className="animate-spin" size={15} />
                                        : <Send size={15} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TaskDetailsDrawer;
