import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

// Global search across projects, tasks, and users
export const searchAll = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const regex = new RegExp(query, 'i');

        // Parallel execution for performance
        const [projects, tasks, users] = await Promise.all([
            // Search projects
            Project.find({
                $and: [
                    {
                        $or: [
                            { name: regex },
                            { description: regex }
                        ]
                    },
                    { isDeleted: { $ne: true } },
                    // Access control: only projects user is part of (unless Admin)
                    req.user.role !== 'Super Admin' ? {
                        $or: [
                            { projectLead: req.user._id },
                            { 'teamMembers.user': req.user._id }
                        ]
                    } : {}
                ]
            })
                .select('name status _id')
                .limit(5)
                .lean(),

            // Search tasks
            Task.find({
                $and: [
                    {
                        $or: [
                            { title: regex },
                            { description: regex }
                        ]
                    },
                    { isDeleted: { $ne: true } },
                    // Access control
                    req.user.role !== 'Super Admin' ? {
                        $or: [
                            { assignedTo: req.user._id },
                            { createdBy: req.user._id },
                            { project: { $in: await getUserProjectIds(req.user._id) } }
                        ]
                    } : {}
                ]
            })
                .select('title status priority projectId _id')
                .populate('project', 'name')
                .limit(5)
                .lean(),

            // Search users (only if Admin or PM)
            ['Super Admin', 'Project Manager', 'Team Lead'].includes(req.user.role) ?
                User.find({
                    $and: [
                        {
                            $or: [
                                { name: regex },
                                { email: regex }
                            ]
                        },
                        { isDeleted: { $ne: true } }
                    ]
                })
                    .select('name email role photo _id')
                    .limit(5)
                    .lean()
                : Promise.resolve([])
        ]);

        res.json({
            success: true,
            data: {
                projects,
                tasks,
                users
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
};

// Helper: Get all project IDs a user is member of
const getUserProjectIds = async (userId) => {
    const projects = await Project.find({
        $or: [
            { projectLead: userId },
            { 'teamMembers.user': userId }
        ]
    }).select('_id');
    return projects.map(p => p._id);
};
