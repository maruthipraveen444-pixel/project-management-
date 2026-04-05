// Role-Based Access Control Middleware
// Defines visibility rules, role hierarchy, and limits

// Role hierarchy (higher index = higher privilege)
export const ROLE_HIERARCHY = {
    'Team Member': 1,
    'Team Lead': 2,
    'Project Manager': 3,
    'Project Admin': 4,
    'Super Admin': 5
};

// Role limits per project/organization
export const ROLE_LIMITS = {
    'Super Admin': 1,
    'Project Admin': 1,
    'Project Manager': 1,
    'Team Lead': 1,
    'Team Member': 10
};

// Visibility rules: which roles each role can see
export const VISIBILITY_RULES = {
    'Super Admin': ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead', 'Team Member'],
    'Project Admin': ['Project Admin', 'Project Manager', 'Team Lead', 'Team Member'],
    'Project Manager': ['Team Lead', 'Team Member'],
    'Team Lead': ['Team Member'],
    'Team Member': [] // Can only see themselves, handled separately
};

// Valid roles that can login
export const VALID_LOGIN_ROLES = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead', 'Team Member'];

// Roles that can manage users
export const ADMIN_ROLES = ['Super Admin'];

// Roles that can view team lists
export const CAN_VIEW_TEAM_ROLES = ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'];

/**
 * Get roles that a user can see based on their role
 * @param {string} userRole - The current user's role
 * @returns {string[]} - Array of visible roles
 */
export const getVisibleRoles = (userRole) => {
    return VISIBILITY_RULES[userRole] || [];
};

/**
 * Check if user can see another user based on roles
 * @param {string} viewerRole - Role of the viewing user
 * @param {string} targetRole - Role of the target user
 * @returns {boolean}
 */
export const canSeeUser = (viewerRole, targetRole) => {
    const visibleRoles = getVisibleRoles(viewerRole);
    return visibleRoles.includes(targetRole);
};

/**
 * Check if user can manage (create/edit/delete) other users
 * @param {string} userRole - The current user's role
 * @returns {boolean}
 */
export const canManageUsers = (userRole) => {
    return ADMIN_ROLES.includes(userRole);
};

/**
 * Check if user can view team list
 * @param {string} userRole - The current user's role
 * @returns {boolean}
 */
export const canViewTeamList = (userRole) => {
    return CAN_VIEW_TEAM_ROLES.includes(userRole);
};

/**
 * Check if role limit is reached
 * @param {Object} roleCounts - Current counts of each role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const isRoleLimitReached = (roleCounts, role) => {
    const limit = ROLE_LIMITS[role];
    const current = roleCounts[role] || 0;
    return current >= limit;
};

/**
 * Get role counts for display
 * @param {Array} users - Array of user objects
 * @returns {Object} - Role counts
 */
export const getRoleCounts = (users) => {
    const counts = {};
    Object.keys(ROLE_LIMITS).forEach(role => {
        counts[role] = users.filter(u => u.role === role).length;
    });
    return counts;
};

/**
 * Build visibility query filter for MongoDB
 * @param {Object} currentUser - The requesting user
 * @returns {Object} - MongoDB query filter
 */
export const buildVisibilityFilter = (currentUser) => {
    const userRole = currentUser.role;

    // Super Admin sees everyone
    if (userRole === 'Super Admin') {
        return {};
    }

    // Team Member can only see themselves
    if (userRole === 'Team Member') {
        return { _id: currentUser._id };
    }

    // Other roles see based on visibility rules
    const visibleRoles = getVisibleRoles(userRole);
    if (visibleRoles.length === 0) {
        return { _id: currentUser._id };
    }

    return { role: { $in: visibleRoles } };
};

/**
 * Middleware to check admin access
 */
export const requireAdmin = (req, res, next) => {
    if (!canManageUsers(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Only Super Admin can perform this action'
        });
    }
    next();
};

/**
 * Middleware to check if user can view team
 */
export const requireTeamView = (req, res, next) => {
    if (!canViewTeamList(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to view team list'
        });
    }
    next();
};

/**
 * Middleware to authorize specific roles for a route
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Middleware to ensure user belongs to an organization
 */
export const checkOrganization = (req, res, next) => {
    if (!req.user.organization) {
        return res.status(403).json({
            success: false,
            message: 'User must belong to an organization'
        });
    }
    next();
};

export default {
    ROLE_HIERARCHY,
    ROLE_LIMITS,
    VISIBILITY_RULES,
    VALID_LOGIN_ROLES,
    ADMIN_ROLES,
    getVisibleRoles,
    canSeeUser,
    canManageUsers,
    canViewTeamList,
    isRoleLimitReached,
    getRoleCounts,
    buildVisibilityFilter,
    requireAdmin,
    requireTeamView,
    authorize,
    checkOrganization
};
