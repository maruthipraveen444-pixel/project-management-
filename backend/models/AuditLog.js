import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    // User who performed the action
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },

    // What was affected
    entityType: {
        type: String,
        required: true,
        enum: ['User', 'Project', 'Task', 'Attendance', 'Leave', 'Document', 'Comment', 'Team']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    entityName: String,

    // The action performed
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE', 'UPDATE', 'DELETE', 'RESTORE',
            'LOGIN', 'LOGOUT',
            'ASSIGN', 'UNASSIGN',
            'APPROVE', 'REJECT',
            'PUNCH_IN', 'PUNCH_OUT',
            'EXPORT', 'IMPORT',
            'STATUS_CHANGE', 'ROLE_CHANGE'
        ]
    },

    // Context
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    projectName: String,

    // Optional additional details (stored as JSON)
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Previous and new values for tracking changes
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,

    // IP and browser info
    ipAddress: String,
    userAgent: String,

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ project: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });

// Static method to log an action
auditLogSchema.statics.log = async function (params) {
    const {
        user,
        entityType,
        entityId,
        entityName,
        action,
        project,
        projectName,
        details,
        previousValue,
        newValue,
        req
    } = params;

    try {
        return await this.create({
            user: user._id || user,
            userName: user.name || 'System',
            userRole: user.role || 'System',
            entityType,
            entityId,
            entityName,
            action,
            project,
            projectName,
            details,
            previousValue,
            newValue,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get?.('User-Agent')
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main operation
    }
};

// Static method to get activity for a user
auditLogSchema.statics.getUserActivity = function (userId, limit = 50) {
    return this.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

// Static method to get activity for a project
auditLogSchema.statics.getProjectActivity = function (projectId, limit = 50) {
    return this.find({ project: projectId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
};

// Static method to get recent activity for admin dashboard
auditLogSchema.statics.getRecentActivity = function (organizationId, limit = 100) {
    return this.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('user', 'name photo role')
        .lean();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
