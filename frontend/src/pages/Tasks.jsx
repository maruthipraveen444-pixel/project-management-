import { useState, useEffect } from 'react';
import {
    Plus, Search, Clock, Calendar,
    MoreVertical, Edit3, Trash2, UserPlus, AlertCircle,
    ChevronDown, X, GripVertical, MessageSquare, CheckCircle2,
    Layers, Zap, ListTodo, PlayCircle, Sparkles
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import UserAvatar from '../components/common/UserAvatar';

/* ══════════════════════════════════════════════════════
   CONFIG
   ══════════════════════════════════════════════════════ */

const COLUMNS = [
    {
        id: 'Open',
        title: 'Open',
        icon: ListTodo,
        grad: 'linear-gradient(135deg,#64748b,#94a3b8)',
        glow: 'rgba(100,116,139,0.45)',
        dot: '#94a3b8',
        border: 'rgba(148,163,184,0.3)',
        bg: 'rgba(148,163,184,0.06)',
    },
    {
        id: 'To Do',
        title: 'To Do',
        icon: Zap,
        grad: 'linear-gradient(135deg,#5b9cf6,#a78bfa)',
        glow: 'rgba(91,156,246,0.45)',
        dot: '#5b9cf6',
        border: 'rgba(91,156,246,0.3)',
        bg: 'rgba(91,156,246,0.05)',
    },
    {
        id: 'In Progress',
        title: 'In Progress',
        icon: PlayCircle,
        grad: 'linear-gradient(135deg,#fbbf24,#f97316)',
        glow: 'rgba(251,191,36,0.45)',
        dot: '#fbbf24',
        border: 'rgba(251,191,36,0.3)',
        bg: 'rgba(251,191,36,0.05)',
    },
    {
        id: 'Completed',
        title: 'Completed',
        icon: CheckCircle2,
        grad: 'linear-gradient(135deg,#34d399,#06b6d4)',
        glow: 'rgba(52,211,153,0.45)',
        dot: '#34d399',
        border: 'rgba(52,211,153,0.3)',
        bg: 'rgba(52,211,153,0.05)',
    },
];

const PRIORITY_STYLES = {
    Critical: { bg:'rgba(167,139,250,0.12)', color:'#c4b5fd', border:'rgba(167,139,250,0.3)', glow:'rgba(167,139,250,0.5)' },
    High:     { bg:'rgba(251,113,133,0.12)', color:'#fda4af', border:'rgba(251,113,133,0.3)', glow:'rgba(251,113,133,0.5)' },
    Medium:   { bg:'rgba(251,191,36,0.12)',  color:'#fde68a', border:'rgba(251,191,36,0.3)',  glow:'rgba(251,191,36,0.5)'  },
    Low:      { bg:'rgba(52,211,153,0.12)',  color:'#6ee7b7', border:'rgba(52,211,153,0.3)',  glow:'rgba(52,211,153,0.5)'  },
};

/* ══════════════════════════════════════════════════════
   TASK CARD
   ══════════════════════════════════════════════════════ */

const TaskCard = ({ task, onDragStart, onDragEnd, onClick, onEdit, onDelete, onAssign, canEdit, isDragging }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, task)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(task)}
            className="group relative cursor-pointer transition-all duration-250 animate-fadeIn"
            style={{
                background: isDragging ? 'rgba(91,156,246,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isDragging ? 'rgba(91,156,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16,
                padding: '14px 16px',
                opacity: isDragging ? 0.6 : 1,
                transform: isDragging ? 'scale(0.97)' : undefined,
            }}
            onMouseEnter={e => {
                if (!isDragging) {
                    e.currentTarget.style.background = 'rgba(91,156,246,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(91,156,246,0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(91,156,246,0.08)';
                }
            }}
            onMouseLeave={e => {
                if (!isDragging) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                }
            }}
        >
            {/* Top bevel */}
            <div className="absolute top-0 left-6 right-6 h-px pointer-events-none"
                 style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)' }} />

            {/* Drag handle */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ color: 'rgba(255,255,255,0.25)' }}>
                <GripVertical size={13} />
            </div>

            {/* ── Top row ── */}
            <div className="flex justify-between items-start mb-2.5 pl-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Priority badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{
                              background: p.bg,
                              color: p.color,
                              border: `1px solid ${p.border}`,
                              boxShadow: `0 0 10px ${p.glow.replace('0.5)','0.2)')}`,
                          }}>
                        {task.priority || 'Medium'}
                    </span>
                    {isOverdue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                              style={{ background:'rgba(251,113,133,0.12)', color:'#fda4af', border:'1px solid rgba(251,113,133,0.3)' }}>
                            <AlertCircle size={9} /> Overdue
                        </span>
                    )}
                </div>

                {/* Context menu */}
                {canEdit && (
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150"
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                color: 'rgba(255,255,255,0.5)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.15)'; e.currentTarget.style.color='#5b9cf6'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
                        >
                            <MoreVertical size={14} />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-1.5 z-[200] overflow-hidden"
                                     style={{
                                         background: 'rgba(7,12,28,0.97)',
                                         backdropFilter: 'blur(32px)',
                                         WebkitBackdropFilter: 'blur(32px)',
                                         border: '1px solid rgba(255,255,255,0.12)',
                                         borderRadius: '14px',
                                         boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.14)',
                                         minWidth: 160,
                                     }}>
                                    {/* Bevel */}
                                    <div className="absolute top-0 left-4 right-4 h-px pointer-events-none"
                                         style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.5),rgba(167,139,250,0.4),transparent)' }} />

                                    <div className="p-1.5 space-y-0.5">
                                        <button
                                            onClick={e => { e.stopPropagation(); onEdit(task); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background='rgba(91,156,246,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.95)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
                                        >
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                 style={{ background:'rgba(91,156,246,0.15)', color:'#5b9cf6' }}>
                                                <Edit3 size={12} />
                                            </div>
                                            Edit task
                                        </button>

                                        <button
                                            onClick={e => { e.stopPropagation(); onAssign(task); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background='rgba(167,139,250,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.95)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
                                        >
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                 style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa' }}>
                                                <UserPlus size={12} />
                                            </div>
                                            Assign
                                        </button>

                                        <div className="my-1 mx-2 h-px" style={{ background:'rgba(255,255,255,0.07)' }} />

                                        <button
                                            onClick={e => { e.stopPropagation(); onDelete(task); setShowMenu(false); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
                                            style={{ color: 'rgba(251,113,133,0.85)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background='rgba(251,113,133,0.1)'; e.currentTarget.style.color='#fda4af'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='rgba(251,113,133,0.85)'; }}
                                        >
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                 style={{ background:'rgba(251,113,133,0.15)', color:'#fb7185' }}>
                                                <Trash2 size={12} />
                                            </div>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── Title & description ── */}
            <div className="pl-3 mb-3">
                <h4 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {task.description}
                    </p>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between pl-3 pt-2.5"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {task.comments?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            <span>{task.comments.length}</span>
                        </div>
                    )}
                    {task.estimatedHours > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{task.timeSpent || 0}/{task.estimatedHours}h</span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-1"
                             style={{ color: isOverdue ? '#fda4af' : undefined }}>
                            <Calendar size={11} />
                            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
                        </div>
                    )}
                </div>

                {/* Avatars */}
                <div className="flex -space-x-1.5">
                    {task.assignedTo?.slice(0, 3).map((u, i) => (
                        <UserAvatar key={i} user={u} size="xs" showBadge={false}
                                    className="ring-[1.5px] hover:z-10 hover:scale-110 transition-all" />
                    ))}
                    {task.assignedTo?.length > 3 && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                             style={{ background:'rgba(91,156,246,0.2)', border:'1.5px solid #03060f', color:'#93c5fd' }}>
                            +{task.assignedTo.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   FILTER TOOLBAR
   ══════════════════════════════════════════════════════ */

const FilterToolbar = ({ searchTerm, setSearchTerm, priorityFilter, setPriorityFilter,
                         assigneeFilter, setAssigneeFilter, teamMembers, onClearFilters }) => {
    const hasFilters = searchTerm || priorityFilter !== 'All' || assigneeFilter !== 'All';

    const selectStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        padding: '8px 32px 8px 12px',
        fontSize: '0.8125rem',
        fontFamily: 'inherit',
        appearance: 'none',
        outline: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    return (
        <div className="flex flex-wrap gap-2.5 mb-5 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'rgba(255,255,255,0.3)' }} />
                <input
                    type="text"
                    placeholder="Search tasks…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-9 pr-4 text-sm transition-all duration-200"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor='rgba(91,156,246,0.5)'; e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.10)'; e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.boxShadow=''; }}
                />
            </div>

            {/* Priority */}
            <div className="relative">
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}
                        onFocus={e => e.target.style.borderColor='rgba(91,156,246,0.4)'}
                        onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'}>
                    <option value="All">All Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                             style={{ color: 'rgba(255,255,255,0.35)' }} />
            </div>

            {/* Assignee */}
            <div className="relative">
                <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} style={selectStyle}
                        onFocus={e => e.target.style.borderColor='rgba(91,156,246,0.4)'}
                        onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'}>
                    <option value="All">All Assignees</option>
                    {teamMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                             style={{ color: 'rgba(255,255,255,0.35)' }} />
            </div>

            {/* Clear */}
            {hasFilters && (
                <button onClick={onClearFilters}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                        style={{ color: 'rgba(251,113,133,0.8)', background:'rgba(251,113,133,0.08)', border:'1px solid rgba(251,113,133,0.2)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(251,113,133,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(251,113,133,0.08)'}>
                    <X size={13} /> Clear
                </button>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   CREATE TASK MODAL
   ══════════════════════════════════════════════════════ */

const CreateTaskModal = ({ isOpen, onClose, onSuccess, projects, defaultStatus = 'To Do' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', project: '',
        priority: 'Medium', status: defaultStatus, dueDate: '', estimatedHours: ''
    });

    useEffect(() => {
        if (isOpen) setFormData(p => ({ ...p, status: defaultStatus, title: '', description: '', dueDate: '', estimatedHours: '' }));
    }, [isOpen, defaultStatus]);

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.project) { alert('Please fill title and select a project'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/tasks', { ...formData, estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : 0 });
            if (data.success) { onSuccess(data.data); onClose(); }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputSt = {
        width:'100%', padding:'0.75rem 1rem', borderRadius:12,
        background:'rgba(255,255,255,0.05)',
        border:'1px solid rgba(255,255,255,0.10)',
        color:'var(--text-primary)', fontSize:'0.875rem', fontFamily:'inherit',
        transition:'all 0.2s ease', boxShadow:'inset 0 2px 6px rgba(0,0,0,0.2)', outline:'none',
    };
    const onF = e => { e.target.style.borderColor='rgba(91,156,246,0.55)'; e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.boxShadow='0 0 0 3px rgba(91,156,246,0.14)'; };
    const onB = e => { e.target.style.borderColor='rgba(255,255,255,0.10)'; e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.boxShadow='inset 0 2px 6px rgba(0,0,0,0.2)'; };

    const labelSt = { display:'block', fontSize:'0.6875rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem', color:'rgba(255,255,255,0.38)' };

    return (
        <>
            <div className="fixed inset-0 z-50" style={{ background:'rgba(3,6,15,0.8)', backdropFilter:'blur(16px)' }} onClick={onClose} />
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
                <div className="w-full max-w-lg overflow-hidden animate-fadeInScale pointer-events-auto">
                    <div className="relative"
                         style={{
                             background: 'rgba(7,12,28,0.95)',
                             backdropFilter: 'blur(40px)',
                             WebkitBackdropFilter: 'blur(40px)',
                             border: '1px solid rgba(255,255,255,0.11)',
                             borderRadius: 24,
                             boxShadow: '0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.16)',
                         }}>
                        {/* Bevel */}
                        <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                             style={{ background:'linear-gradient(90deg,transparent,rgba(91,156,246,0.5),rgba(167,139,250,0.4),transparent)' }} />

                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5"
                         style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[12px] flex items-center justify-center relative overflow-hidden"
                                 style={{
                                     background:'linear-gradient(135deg,#5b9cf6,#a78bfa)',
                                     border:'1px solid rgba(255,255,255,0.2)',
                                     boxShadow:'0 4px 16px rgba(91,156,246,0.4)',
                                 }}>
                                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[12px]" style={{ background:'rgba(255,255,255,0.2)' }} />
                                <Plus size={16} className="text-white relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold" style={{ color:'var(--text-primary)' }}>Create New Task</h2>
                                <p className="text-xs" style={{ color:'var(--text-secondary)' }}>Fill in the task details below</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                                style={{ color:'rgba(255,255,255,0.45)', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}
                                onMouseEnter={e => { e.currentTarget.style.background='rgba(251,113,133,0.12)'; e.currentTarget.style.color='#fda4af'; }}
                                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label style={labelSt}>Task Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange}
                                   placeholder="Enter task title" required style={inputSt} onFocus={onF} onBlur={onB} />
                        </div>

                        <div>
                            <label style={labelSt}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange}
                                      placeholder="Describe the task…" rows={3}
                                      style={{ ...inputSt, resize:'none' }} onFocus={onF} onBlur={onB} />
                        </div>

                        <div>
                            <label style={labelSt}>Project *</label>
                            <select name="project" value={formData.project} onChange={handleChange} required
                                    style={inputSt} onFocus={onF} onBlur={onB}>
                                <option value="">Select a project</option>
                                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={labelSt}>Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange}
                                        style={inputSt} onFocus={onF} onBlur={onB}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelSt}>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}
                                        style={inputSt} onFocus={onF} onBlur={onB}>
                                    <option value="Open">Open</option>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={labelSt}>Due Date</label>
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                                       style={inputSt} onFocus={onF} onBlur={onB} />
                            </div>
                            <div>
                                <label style={labelSt}>Est. Hours</label>
                                <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange}
                                       placeholder="0" min="0" style={inputSt} onFocus={onF} onBlur={onB} />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.10)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2">
                                {loading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Plus size={16}/> Create Task</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            </div>
        </>
    );
};

/* ══════════════════════════════════════════════════════
   MAIN TASKS PAGE
   ══════════════════════════════════════════════════════ */

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [assigneeFilter, setAssigneeFilter] = useState('All');
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('To Do');
    const [toast, setToast] = useState(null);

    const canEdit = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(user?.role);

    useEffect(() => { fetchTasks(); fetchTeamMembers(); fetchProjects(); }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            if (data.success) setTasks(data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchTeamMembers = async () => {
        try {
            const { data } = await api.get('/dashboard/team?limit=100');
            if (data.success) setTeamMembers(data.data);
        } catch (e) {}
    };

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            if (data.success) setProjects(data.data);
        } catch (e) {}
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDragStart = (e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragEnd   = () => { setDraggedTask(null); setDragOverColumn(null); };
    const handleDragOver  = (e, col) => { e.preventDefault(); setDragOverColumn(col); };
    const handleDragLeave = () => setDragOverColumn(null);

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        if (!draggedTask || draggedTask.status === newStatus) { setDragOverColumn(null); return; }
        const old = draggedTask.status;
        setTasks(prev => prev.map(t => t._id === draggedTask._id ? { ...t, status: newStatus } : t));
        try {
            await api.put(`/tasks/${draggedTask._id}`, { status: newStatus });
            showToast(`Moved to ${newStatus}`);
        } catch {
            setTasks(prev => prev.map(t => t._id === draggedTask._id ? { ...t, status: old } : t));
            showToast('Failed to move task', 'error');
        }
        setDraggedTask(null); setDragOverColumn(null);
    };

    const getFilteredTasks = status => tasks.filter(t => {
        if (t.status !== status) return false;
        if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
        if (assigneeFilter !== 'All' && !t.assignedTo?.some(u => u._id === assigneeFilter)) return false;
        return true;
    });

    const clearFilters = () => { setSearchTerm(''); setPriorityFilter('All'); setStatusFilter('All'); setAssigneeFilter('All'); };
    const handleTaskClick = t => { setSelectedTask(t); setDrawerOpen(true); };
    const handleEdit   = t => console.log('Edit:', t);
    const handleDelete = async t => {
        if (!confirm('Delete this task?')) return;
        try { await api.delete(`/tasks/${t._id}`); setTasks(p => p.filter(x => x._id !== t._id)); showToast('Task deleted'); }
        catch { showToast('Failed to delete', 'error'); }
    };
    const handleAssign = t => { setSelectedTask(t); setDrawerOpen(true); };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                     style={{ borderColor:'rgba(91,156,246,0.3)', borderTopColor:'#5b9cf6' }} />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                             style={{ background:'rgba(91,156,246,0.1)', border:'1px solid rgba(91,156,246,0.25)', color:'#5b9cf6' }}>
                            <Layers size={10}/> Kanban Board
                        </div>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1"
                        style={{
                            background:'linear-gradient(135deg,#eef2ff 0%,#93c5fd 50%,#c4b5fd 100%)',
                            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                        }}>
                        Task Board
                    </h1>
                    <p className="text-sm" style={{ color:'var(--text-secondary)' }}>
                        Drag and drop tasks to update their status
                    </p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => { setDefaultStatus('To Do'); setCreateModalOpen(true); }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                        <Plus size={16}/> New Task
                    </button>
                )}
            </div>

            {/* ── Filters ── */}
            <FilterToolbar
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                assigneeFilter={assigneeFilter} setAssigneeFilter={setAssigneeFilter}
                teamMembers={teamMembers} onClearFilters={clearFilters}
            />

            {/* ── Kanban Board ── */}
            <div className="flex-1 overflow-hidden pb-2">
                <div className="flex gap-4 h-full">
                    {COLUMNS.map(col => {
                        const colTasks = getFilteredTasks(col.id);
                        const isDragOver = dragOverColumn === col.id;
                        const ColIcon = col.icon;

                        return (
                            <div
                                key={col.id}
                                className="flex-1 min-w-0 flex flex-col rounded-[20px] overflow-hidden transition-all duration-250"
                                style={{
                                    background: isDragOver ? col.bg : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${isDragOver ? col.border : 'rgba(255,255,255,0.07)'}`,
                                    boxShadow: isDragOver ? `0 0 32px ${col.glow.replace('0.45','0.15')}` : undefined,
                                }}
                                onDragOver={e => handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={e => handleDrop(e, col.id)}
                            >
                                {/* Column header */}
                                <div className="px-4 py-3.5 flex justify-between items-center flex-shrink-0"
                                     style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="flex items-center gap-2.5">
                                        {/* Gradient icon */}
                                        <div className="w-7 h-7 rounded-[9px] flex items-center justify-center relative overflow-hidden flex-shrink-0"
                                             style={{
                                                 background: col.grad,
                                                 border: '1px solid rgba(255,255,255,0.2)',
                                                 boxShadow: `0 3px 12px ${col.glow.replace('0.45','0.35')}`,
                                             }}>
                                            <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[9px]"
                                                 style={{ background:'rgba(255,255,255,0.2)' }} />
                                            <ColIcon size={13} className="text-white relative z-10" />
                                        </div>
                                        <span className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>
                                            {col.title}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                          style={{
                                              background: `${col.glow.replace('0.45','0.15')}`,
                                              color: col.dot,
                                              border: `1px solid ${col.border}`,
                                          }}>
                                        {colTasks.length}
                                    </span>
                                </div>

                                {/* Task list */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                                    {colTasks.map(task => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onClick={handleTaskClick}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAssign={handleAssign}
                                            canEdit={canEdit}
                                            isDragging={draggedTask?._id === task._id}
                                        />
                                    ))}

                                    {colTasks.length === 0 && (
                                        <div className="py-10 text-center">
                                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                                                 style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                                                <ColIcon size={18} style={{ color:'rgba(255,255,255,0.2)' }} />
                                            </div>
                                            <p className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>No tasks</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add task button */}
                                {canEdit && (
                                    <button
                                        onClick={() => { setDefaultStatus(col.id); setCreateModalOpen(true); }}
                                        className="mx-3 mb-3 p-2.5 rounded-[12px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 flex-shrink-0"
                                        style={{
                                            border: `1px dashed ${col.border}`,
                                            color: col.dot,
                                            background: 'transparent',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background=col.bg; }}
                                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                                    >
                                        <Plus size={13} /> Add Task
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Drawer ── */}
            <TaskDetailsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                task={selectedTask}
                onTaskUpdated={fetchTasks}
                userRole={user?.role}
                canEdit={canEdit}
                teamMembers={teamMembers}
            />

            {/* ── Create Modal ── */}
            <CreateTaskModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={newTask => { setTasks(p => [newTask, ...p]); showToast('Task created!'); }}
                projects={projects}
                defaultStatus={defaultStatus}
            />

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-[14px] text-sm font-medium animate-slide-up"
                     style={{
                         background: toast.type === 'error'
                             ? 'linear-gradient(135deg,rgba(251,113,133,0.95),rgba(244,63,94,0.95))'
                             : 'linear-gradient(135deg,rgba(52,211,153,0.95),rgba(6,182,212,0.95))',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(255,255,255,0.25)',
                         boxShadow: toast.type === 'error'
                             ? '0 8px 32px rgba(251,113,133,0.4)'
                             : '0 8px 32px rgba(52,211,153,0.4)',
                         color: 'white',
                     }}>
                    {toast.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Tasks;
