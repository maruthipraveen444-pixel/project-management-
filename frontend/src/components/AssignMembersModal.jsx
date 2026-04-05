import { useState, useEffect } from 'react';
import {
    X, Search, Users, Check, ChevronDown,
    UserPlus, UserMinus, Loader
} from 'lucide-react';
import api from '../utils/api';
import UserAvatar from './common/UserAvatar';
import RoleIcon from './common/RoleIcon';


// Generate gradient colors based on name
const getGradientColors = (name) => {
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#a18cd1', '#fbc2eb'],
        ['#ff9a9e', '#fecfef'],
        ['#667eea', '#764ba2']
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
};

// Get initials from name
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Role badge color mapping
const getRoleBadgeClass = (role) => {
    const roleMap = {
        'Super Admin': 'bg-purple-500/20 text-purple-400',
        'Project Admin': 'bg-purple-500/20 text-purple-400',
        'Project Manager': 'bg-blue-500/20 text-blue-400',
        'Team Lead': 'bg-cyan-500/20 text-cyan-400',
        'Team Member': 'bg-green-500/20 text-green-400',
        'Client': 'bg-yellow-500/20 text-yellow-400',
    };
    return roleMap[role] || 'bg-gray-500/20 text-gray-400';
};

const AssignMembersModal = ({
    isOpen,
    onClose,
    project,
    onMembersUpdated,
    userRole
}) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [selectedMembers, setSelectedMembers] = useState(new Set());
    const [assignedMembers, setAssignedMembers] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(null);

    // Check if user can assign/remove members
    const canManageMembers = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(userRole);

    useEffect(() => {
        if (isOpen && project) {
            fetchMembers();
            // Initialize assigned members from project
            const assigned = new Set(project.teamMembers?.map(m => m.user?._id || m.user) || []);
            setAssignedMembers(assigned);
            setSelectedMembers(new Set());
        }
    }, [isOpen, project]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/dashboard/team?limit=100');
            if (data.success) {
                setMembers(data.data);
                if (data.filters) {
                    setRoles(data.filters.roles || []);
                    setDepartments(data.filters.departments || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch team members', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMemberSelection = (memberId) => {
        if (!canManageMembers) return;

        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
    };

    const handleAssignSelected = async () => {
        if (!canManageMembers || selectedMembers.size === 0) return;

        setAssigning(true);
        try {
            // Assign each selected member
            for (const memberId of selectedMembers) {
                if (!assignedMembers.has(memberId)) {
                    await api.post(`/projects/${project._id}/members`, {
                        userId: memberId,
                        role: 'Team Member'
                    });
                }
            }

            // Refresh assigned members
            const newAssigned = new Set([...assignedMembers, ...selectedMembers]);
            setAssignedMembers(newAssigned);
            setSelectedMembers(new Set());

            if (onMembersUpdated) {
                onMembersUpdated();
            }
        } catch (error) {
            console.error('Failed to assign members', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!canManageMembers) return;

        setRemoving(memberId);
        try {
            await api.delete(`/projects/${project._id}/members/${memberId}`);

            const newAssigned = new Set(assignedMembers);
            newAssigned.delete(memberId);
            setAssignedMembers(newAssigned);

            if (onMembersUpdated) {
                onMembersUpdated();
            }
        } catch (error) {
            console.error('Failed to remove member', error);
        } finally {
            setRemoving(null);
        }
    };

    // Filter members based on search and filters
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || member.role === roleFilter;
        const matchesDepartment = departmentFilter === 'All' || member.department === departmentFilter;
        return matchesSearch && matchesRole && matchesDepartment;
    });

    // Separate assigned and unassigned members
    const assignedMembersList = filteredMembers.filter(m => assignedMembers.has(m._id));
    const unassignedMembersList = filteredMembers.filter(m => !assignedMembers.has(m._id));

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-border z-50 shadow-2xl drawer-slide-in overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <Users size={24} className="text-primary-400" />
                            Assign Members
                        </h2>
                        <p className="text-text-muted text-sm mt-1">
                            {project?.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="p-4 space-y-3 border-b border-border shrink-0">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="input-field appearance-none pr-8 cursor-pointer text-sm"
                            >
                                <option value="All">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="input-field appearance-none pr-8 cursor-pointer text-sm"
                            >
                                <option value="All">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Permission Warning */}
                {!canManageMembers && (
                    <div className="mx-4 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                        Only Project Managers or Team Leads can assign members.
                    </div>
                )}

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader className="animate-spin text-primary-400" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* Assigned Members Section */}
                            {assignedMembersList.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2">
                                        <Check size={16} className="text-green-400" />
                                        Assigned ({assignedMembersList.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {assignedMembersList.map((member) => {
                                            const gradientColors = getGradientColors(member.name);
                                            return (
                                                <div
                                                    key={member._id}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-green-500/20"
                                                >
                                                    {/* Avatar */}
                                                    <UserAvatar user={member} size="md" />

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <RoleIcon role={member.role} size={14} />
                                                            <p className="text-white font-medium truncate">{member.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-dark-400 capitalize">{member.role}</span>
                                                            {member.department && (
                                                                <span className="text-xs text-dark-400">• {member.department}</span>
                                                            )}
                                                        </div>
                                                    </div>


                                                    {/* Remove Button */}
                                                    {canManageMembers && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member._id)}
                                                            disabled={removing === member._id}
                                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                                                            title="Remove from project"
                                                        >
                                                            {removing === member._id ? (
                                                                <Loader className="animate-spin" size={16} />
                                                            ) : (
                                                                <UserMinus size={16} />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Unassigned Members Section */}
                            {unassignedMembersList.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-text-muted mb-3">
                                        Available Members ({unassignedMembersList.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {unassignedMembersList.map((member) => {
                                            const gradientColors = getGradientColors(member.name);
                                            const isSelected = selectedMembers.has(member._id);
                                            return (
                                                <div
                                                    key={member._id}
                                                    onClick={() => toggleMemberSelection(member._id)}
                                                    className={`
                                                        flex items-center gap-3 p-3 rounded-xl border transition-all
                                                        ${canManageMembers ? 'cursor-pointer hover:bg-surface/50' : 'cursor-not-allowed opacity-60'}
                                                        ${isSelected
                                                            ? 'bg-primary-500/10 border-primary-500/30'
                                                            : 'bg-surface/30 border-border'}
                                                    `}
                                                >
                                                    {/* Checkbox */}
                                                    {canManageMembers && (
                                                        <div className={`
                                                            w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                                                            ${isSelected
                                                                ? 'bg-primary-500 border-primary-500'
                                                                : 'border-text-muted'}
                                                        `}>
                                                            {isSelected && <Check size={12} className="text-white" />}
                                                        </div>
                                                    )}

                                                    {/* Avatar */}
                                                    <UserAvatar user={member} size="md" />

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <RoleIcon role={member.role} size={14} />
                                                            <p className="text-white font-medium truncate">{member.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-dark-400 capitalize">{member.role}</span>
                                                            {member.department && (
                                                                <span className="text-xs text-dark-400">• {member.department}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {filteredMembers.length === 0 && (
                                <div className="text-center py-12 text-text-muted">
                                    No members found matching your search.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer with Assign Button */}
                {canManageMembers && selectedMembers.size > 0 && (
                    <div className="p-4 border-t border-border shrink-0">
                        <button
                            onClick={handleAssignSelected}
                            disabled={assigning}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {assigning ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Assign {selectedMembers.size} Member{selectedMembers.size > 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div >
        </>
    );
};

export default AssignMembersModal;
