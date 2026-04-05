import AuditLog from '../models/AuditLog.js';

// Get activity logs with filters
export const getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            user,
            project,
            entityType,
            action,
            startDate,
            endDate
        } = req.query;

        // Build filter
        const filter = {};

        if (user) filter.user = user;
        if (project) filter.project = project;
        if (entityType) filter.entityType = entityType;
        if (action) filter.action = action;

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Only Super Admin and Project Manager can view all logs
        if (!['Super Admin', 'Project Manager'].includes(req.user.role)) {
            filter.user = req.user._id; // Regular users can only see their own activity
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name photo role')
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs'
        });
    }
};

// Get activity for a specific project
export const getProjectActivity = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 20 } = req.query;

        const logs = await AuditLog.find({ project: projectId })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .populate('user', 'name photo role')
            .lean();

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching project activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project activity'
        });
    }
};

// Get my activity
export const getMyActivity = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const logs = await AuditLog.find({ user: req.user._id })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity'
        });
    }
};

// Get activity summary (for dashboard)
export const getActivitySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const summary = await AuditLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: today }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentLogs = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('user', 'name photo')
            .lean();

        res.json({
            success: true,
            data: {
                todaySummary: summary,
                recentActivity: recentLogs
            }
        });
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity summary'
        });
    }
};

// Export activity logs to CSV
export const exportActivityLogs = async (req, res) => {
    try {
        const { startDate, endDate, format = 'csv' } = req.query;

        // Only admins can export
        if (!['Super Admin', 'Project Manager'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to export logs'
            });
        }

        const filter = {};
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .sort({ timestamp: -1 })
            .limit(10000)
            .lean();

        if (format === 'csv') {
            const csvHeader = 'Timestamp,User,Role,Action,Entity Type,Entity Name,Project,Details\n';
            const csvData = logs.map(log => {
                return `"${log.timestamp}","${log.userName}","${log.userRole}","${log.action}","${log.entityType}","${log.entityName || ''}","${log.projectName || ''}","${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=activity_logs.csv');
            return res.send(csvHeader + csvData);
        }

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Error exporting activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export activity logs'
        });
    }
};
