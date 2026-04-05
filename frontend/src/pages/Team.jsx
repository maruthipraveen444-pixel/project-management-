import { useState, useEffect } from 'react';
import {
    Search, Filter, Mail, Phone, MapPin, X,
    Edit, Trash2, Eye, MessageSquare, ChevronDown,
    Briefcase, Calendar, CheckCircle, Clock, UserPlus
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/common/UserAvatar';
import RoleIcon from '../components/common/RoleIcon';


// Role badge color mapping
const getRoleBadgeClass = (role) => {
    const roleMap = {
        'Super Admin': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Project Admin': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Project Manager': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Team Lead': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'Team Member': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Client': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return roleMap[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

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

// Add Member Modal Component
const AddMemberModal = ({ isOpen, onClose, onSuccess, roles, roleCounts }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'Team Member',
        department: '',
        designation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/dashboard/team', formData);
            if (data.success) {
                onSuccess(data.data);
                onClose();
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    role: 'Team Member',
                    department: '',
                    designation: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team member');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-surface rounded-2xl border border-border w-full max-w-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                            <UserPlus size={24} className="text-primary-400" />
                            Add Team Member
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-text-muted mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-text-muted mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="Team Member">Team Member</option>
                                    <option value="Team Lead">Team Lead</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Project Admin">Project Admin</option>
                                    <option value="Client">Client</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Department</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Human Resources">Human Resources</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Product">Product</option>
                                    <option value="Quality Assurance">Quality Assurance</option>
                                    <option value="Customer Support">Customer Support</option>
                                    <option value="IT">IT</option>
                                    <option value="Legal">Legal</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-text-muted mb-2">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Senior Developer"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-primary"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                    'Add Member'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

// Team Toolbar Component
const TeamToolbar = ({
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    roles,
    departments,
    onAddMember,
    canAddMember,
    roleCounts
}) => {
    return (
        <div className="space-y-4 mb-6">
            {/* Role Count Badges */}
            {roleCounts && Object.keys(roleCounts).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(roleCounts).map(([role, { current, limit }]) => {
                        const isAtLimit = current >= limit;
                        return (
                            <div
                                key={role}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${isAtLimit
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-surface border-border text-text-muted'
                                    }`}
                            >
                                {role}: {current}/{limit}
                                {isAtLimit && <span className="ml-1">✓</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 w-full"
                    />
                </div>

                {/* Role Filter */}
                <div className="relative min-w-[160px]">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input-field appearance-none pr-10 cursor-pointer"
                    >
                        <option value="All">All Roles</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                </div>

                {/* Department Filter */}
                <div className="relative min-w-[160px]">
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="input-field appearance-none pr-10 cursor-pointer"
                    >
                        <option value="All">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                </div>

                {/* Add Member Button - Only for Super Admin */}
                {canAddMember && (
                    <button onClick={onAddMember} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        <UserPlus size={18} />
                        Add Member
                    </button>
                )}
            </div>
        </div>
    );
};

// Team Member Card Component
const TeamMemberCard = ({ member, onCardClick, userRole }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [gradientColors] = useState(() => getGradientColors(member.name));

    const canEdit = userRole === 'Super Admin';
    const canDelete = userRole === 'Super Admin';
    const canMessage = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'].includes(userRole);

    return (
        <div
            className={`
                card glass text-center group cursor-pointer relative overflow-hidden
                transition-all duration-300 ease-out
                ${isHovered ? 'transform -translate-y-2 shadow-2xl border-primary-500/50' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onCardClick(member)}
            style={{
                boxShadow: isHovered ? '0 0 30px rgba(59, 130, 246, 0.2)' : undefined
            }}
        >
            {/* Glow effect on hover */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}
            />

            {/* Quick Actions - visible on hover */}
            <div className={`
                absolute top-3 right-3 flex gap-1 z-10
                transition-all duration-300 transform
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}>
                <button
                    onClick={(e) => { e.stopPropagation(); onCardClick(member); }}
                    className="p-2 rounded-lg bg-surface/80 hover:bg-primary-600 text-text-muted hover:text-white transition-colors"
                    title="View"
                >
                    <Eye size={14} />
                </button>
                {canEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 rounded-lg bg-surface/80 hover:bg-blue-600 text-text-muted hover:text-white transition-colors"
                        title="Edit"
                    >
                        <Edit size={14} />
                    </button>
                )}
                {canMessage && (
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 rounded-lg bg-surface/80 hover:bg-green-600 text-text-muted hover:text-white transition-colors"
                        title="Message"
                    >
                        <MessageSquare size={14} />
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 rounded-lg bg-surface/80 hover:bg-red-600 text-text-muted hover:text-white transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Avatar with colored ring and badge */}
            <div className="mb-4">
                <UserAvatar user={member} size="lg" />
            </div>


            {/* Member Info */}
            <div className="flex items-center justify-center gap-2 mb-1">
                <RoleIcon role={member.role} size={16} />
                <h3 className="text-lg font-bold text-text-main">{member.name}</h3>
            </div>


            {/* Role Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-2 ${getRoleBadgeClass(member.role)}`}>
                {member.role}
            </span>

            <p className="text-text-muted text-xs mb-4">{member.department || 'No Department'}</p>

            {/* Contact Actions */}
            <div className="flex justify-center gap-3 pt-4 border-t border-border text-text-muted">
                <button
                    onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${member.email}`; }}
                    className="p-2 rounded-lg hover:bg-surface hover:text-primary-400 transition-all duration-200 transform hover:scale-110"
                    title={member.email}
                >
                    <Mail size={18} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); if (member.phone) window.location.href = `tel:${member.phone}`; }}
                    className="p-2 rounded-lg hover:bg-surface hover:text-primary-400 transition-all duration-200 transform hover:scale-110"
                    title={member.phone || 'No phone'}
                >
                    <Phone size={18} />
                </button>
                <button
                    className="p-2 rounded-lg hover:bg-surface hover:text-primary-400 transition-all duration-200 transform hover:scale-110"
                >
                    <MapPin size={18} />
                </button>
            </div>
        </div>
    );
};

// Profile Drawer Component
const ProfileDrawer = ({ isOpen, onClose, memberId }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && memberId) {
            fetchProfile();
        }
    }, [isOpen, memberId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/dashboard/team/${memberId}`);
            if (data.success) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const gradientColors = getGradientColors(profile?.member?.name);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border 
                    shadow-2xl z-50 overflow-y-auto
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-text-main">Member Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-6 space-y-4">
                        <div className="h-24 w-24 mx-auto rounded-full bg-surface animate-pulse" />
                        <div className="h-6 bg-surface rounded animate-pulse" />
                        <div className="h-4 bg-surface rounded w-2/3 mx-auto animate-pulse" />
                    </div>
                ) : profile ? (
                    <div className="p-6">
                        {/* Avatar */}
                        <div className="text-center mb-6">
                            <UserAvatar user={profile.member} size="xl" />

                            <div className="flex items-center justify-center gap-2 mt-4">
                                <RoleIcon role={profile.member.role} size={20} />
                                <h3 className="text-xl font-bold text-text-main">{profile.member.name}</h3>
                            </div>


                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${getRoleBadgeClass(profile.member.role)}`}>
                                {profile.member.role}
                            </span>

                            <p className="text-text-muted text-sm mt-2">{profile.member.department || 'No Department'}</p>

                            {/* Status Badge */}
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${profile.member.isActive !== false
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}>
                                {profile.member.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6 p-4 bg-surface/50 rounded-xl">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={16} className="text-primary-400" />
                                <span className="text-text-main">{profile.member.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone size={16} className="text-primary-400" />
                                <span className="text-text-main">{profile.member.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase size={16} className="text-primary-400" />
                                <span className="text-text-main">{profile.member.designation || 'No designation'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar size={16} className="text-primary-400" />
                                <span className="text-text-main">
                                    Joined {profile.member.joiningDate
                                        ? new Date(profile.member.joiningDate).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Assigned Projects */}
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Briefcase size={14} />
                                Assigned Projects ({profile.assignedProjects.length})
                            </h4>
                            {profile.assignedProjects.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.assignedProjects.map((project) => (
                                        <div
                                            key={project._id}
                                            className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg hover:bg-surface transition-colors"
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: project.color || '#3b82f6' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-text-main text-sm font-medium truncate">{project.name}</p>
                                                <p className="text-text-muted text-xs">{project.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-muted text-sm">No projects assigned</p>
                            )}
                        </div>

                        {/* Assigned Tasks */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                                <CheckCircle size={14} />
                                Assigned Tasks ({profile.assignedTasks.length})
                            </h4>
                            {profile.assignedTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.assignedTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="p-3 bg-surface/50 rounded-lg hover:bg-surface transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-text-main text-sm font-medium">{task.title}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                                    task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs ${task.status === 'Completed' ? 'text-green-400' :
                                                    task.status === 'In Progress' ? 'text-blue-400' :
                                                        'text-text-muted'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                                {task.dueDate && (
                                                    <>
                                                        <span className="text-text-muted">•</span>
                                                        <span className="text-text-muted text-xs flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-muted text-sm">No tasks assigned</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-text-muted">
                        Failed to load profile
                    </div>
                )}
            </div>
        </>
    );
};

// Main Team Component
const Team = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [pagination, setPagination] = useState({ currentPage: 1, hasMore: false, totalCount: 0 });
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [roleCounts, setRoleCounts] = useState({});
    const [permissions, setPermissions] = useState({ canManageUsers: false, canViewAll: false });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchTeam(1, true);
    }, [debouncedSearch, roleFilter, departmentFilter]);

    const fetchTeam = async (page = 1, reset = false) => {
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                page,
                limit: 12,
                search: debouncedSearch,
                role: roleFilter,
                department: departmentFilter
            });

            const { data } = await api.get(`/dashboard/team?${params}`);

            if (data.success) {
                if (reset) {
                    setTeam(data.data);
                } else {
                    setTeam(prev => [...prev, ...data.data]);
                }
                setPagination(data.pagination);

                if (data.filters) {
                    setRoles(data.filters.roles || []);
                    setDepartments(data.filters.departments || []);
                }

                if (data.roleCounts) {
                    setRoleCounts(data.roleCounts);
                }

                if (data.permissions) {
                    setPermissions(data.permissions);
                }
            }
        } catch (error) {
            console.error('Failed to fetch team', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && !loadingMore) {
            fetchTeam(pagination.currentPage + 1, false);
        }
    };

    const handleCardClick = (member) => {
        setSelectedMemberId(member._id);
        setDrawerOpen(true);
    };

    const handleAddMember = () => {
        setAddMemberModalOpen(true);
    };

    const handleMemberCreated = (newMember) => {
        // Add the new member to the beginning of the team list
        setTeam(prev => [newMember, ...prev]);
        setPagination(prev => ({ ...prev, totalCount: prev.totalCount + 1 }));
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-main mb-1">Team Members</h1>
                    <p className="text-text-muted">
                        Meet your colleagues and collaborators
                        {pagination.totalCount > 0 && (
                            <span className="text-text-muted"> • {pagination.totalCount} members</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <TeamToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                departmentFilter={departmentFilter}
                setDepartmentFilter={setDepartmentFilter}
                roles={roles}
                departments={departments}
                onAddMember={handleAddMember}
                canAddMember={permissions.canManageUsers}
                roleCounts={permissions.canManageUsers ? roleCounts : null}
            />

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-64 bg-dark-800 rounded-xl animate-pulse" />
                    ))
                ) : team.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="text-dark-500 mb-4">
                            <Search size={48} className="mx-auto opacity-50" />
                        </div>
                        <p className="text-dark-400 mb-2">No team members found</p>
                        <p className="text-dark-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    team.map((member) => (
                        <TeamMemberCard
                            key={member._id}
                            member={member}
                            onCardClick={handleCardClick}
                            userRole={user?.role}
                        />
                    ))
                )}
            </div>

            {/* Load More Button */}
            {!loading && pagination.hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn-secondary min-w-[200px]"
                    >
                        {loadingMore ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                            `Load More (${pagination.totalCount - team.length} remaining)`
                        )}
                    </button>
                </div>
            )}

            {/* Profile Drawer */}
            <ProfileDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                memberId={selectedMemberId}
            />

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={addMemberModalOpen}
                onClose={() => setAddMemberModalOpen(false)}
                onSuccess={handleMemberCreated}
                roles={roles}
                roleCounts={roleCounts}
            />
        </div>
    );
};

export default Team;
