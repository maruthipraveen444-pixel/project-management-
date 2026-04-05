// User roles
export const USER_ROLES = {
    SUPER_ADMIN: 'Super Admin',
    PROJECT_ADMIN: 'Project Admin',
    PROJECT_MANAGER: 'Project Manager',
    TEAM_LEAD: 'Team Lead',
    TEAM_MEMBER: 'Team Member',
    CLIENT: 'Client',
};

// Task statuses
export const TASK_STATUS = {
    OPEN: 'Open',
    TO_DO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    COMPLETED: 'Completed',
    BLOCKED: 'Blocked',
};

// Project statuses
export const PROJECT_STATUS = {
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
};

// Priority levels
export const PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};

// Status colors
export const STATUS_COLORS = {
    [TASK_STATUS.OPEN]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    [TASK_STATUS.TO_DO]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [TASK_STATUS.IN_PROGRESS]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [TASK_STATUS.IN_REVIEW]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    [TASK_STATUS.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [TASK_STATUS.BLOCKED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Priority colors
export const PRIORITY_COLORS = {
    [PRIORITY.LOW]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    [PRIORITY.MEDIUM]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [PRIORITY.HIGH]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    [PRIORITY.CRITICAL]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Chart colors
export const CHART_COLORS = {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#8b5cf6',
    PURPLE: '#a855f7',
    PINK: '#ec4899',
    INDIGO: '#6366f1',
};
