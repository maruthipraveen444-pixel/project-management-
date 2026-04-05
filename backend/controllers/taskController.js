import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper to build task visibility filter based on role
const getTaskFilter = async (user) => {
    const { _id, role } = user;

    // Super Admin and Project Admin see everything
    if (role === 'Super Admin' || role === 'Project Admin') {
        return {};
    }

    // Team Member sees only their own tasks
    if (role === 'Team Member') {
        return { assignedTo: _id };
    }

    // Project Manager sees tasks in their projects OR tasks assigned to them
    if (role === 'Project Manager') {
        const pmProjects = await Project.find({ projectLead: _id }).select('_id');
        const projectIds = pmProjects.map(p => p._id);
        return {
            $or: [
                { project: { $in: projectIds } },
                { assignedTo: _id }
            ]
        };
    }

    // Team Lead sees their tasks + tasks of Team Members in their projects
    if (role === 'Team Lead') {
        // Find projects where user is a team member
        const tlProjects = await Project.find({
            'teamMembers.user': _id
        }).select('_id teamMembers');

        const projectIds = tlProjects.map(p => p._id);

        // Find all "Team Member" users in these projects
        const teamMemberIds = new Set();
        tlProjects.forEach(p => {
            p.teamMembers.forEach(m => {
                if (m.role === 'Team Member') {
                    teamMemberIds.add(m.user.toString());
                }
            });
        });

        return {
            $or: [
                { assignedTo: _id },
                {
                    $and: [
                        { project: { $in: projectIds } },
                        { assignedTo: { $in: Array.from(teamMemberIds) } }
                    ]
                }
            ]
        };
    }

    // Default: see only assigned tasks
    return { assignedTo: _id };
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const roleFilter = await getTaskFilter(req.user);
        const query = { ...roleFilter };

        // Filter by project if provided (and authorized)
        if (req.query.project) {
            query.project = req.query.project;
        }

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by assignee if provided
        if (req.query.assignedTo) {
            query.assignedTo = req.query.assignedTo;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name photo email')
            .populate('createdBy', 'name photo')
            .populate('project', 'name')
            .sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
    try {
        const roleFilter = await getTaskFilter(req.user);
        const task = await Task.findOne({ _id: req.params.id, ...roleFilter })
            .populate('assignedTo', 'name photo email')
            .populate('createdBy', 'name photo')
            .populate('project', 'name')
            .populate('comments.user', 'name photo');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    try {
        const taskData = {
            ...req.body,
            createdBy: req.user._id
        };

        const task = await Task.create(taskData);

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name photo email')
            .populate('createdBy', 'name photo')
            .populate('project', 'name');

        res.status(201).json({
            success: true,
            data: populatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
    try {
        const roleFilter = await getTaskFilter(req.user);
        let task = await Task.findOne({ _id: req.params.id, ...roleFilter });

        if (!task) {
            return res.status(403).json({
                success: false,
                message: 'Task not found or you are not authorized to access it'
            });
        }

        // Matrix Rule: Team Member cannot assign tasks
        if (req.user.role === 'Team Member' && req.body.assignedTo) {
            // Check if they are trying to change assignment
            if (req.body.assignedTo.toString() !== task.assignedTo?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Team members are not authorized to assign or reassign tasks'
                });
            }
        }

        // Prevent changing project association for non-admins
        if (req.user.role !== 'Super Admin' && req.user.role !== 'Project Admin' && req.body.project && req.body.project.toString() !== task.project.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Changing task project is not authorized'
            });
        }


        // If status is being changed to Completed, set completedAt
        if (req.body.status === 'Completed' && task.status !== 'Completed') {
            req.body.completedAt = new Date();
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('assignedTo', 'name photo email')
            .populate('createdBy', 'name photo')
            .populate('project', 'name');

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Project Manager, Team Lead)
export const deleteTask = async (req, res) => {
    try {
        const roleFilter = await getTaskFilter(req.user);
        const task = await Task.findOne({ _id: req.params.id, ...roleFilter });

        if (!task) {
            return res.status(403).json({
                success: false,
                message: 'Task not found or you are not authorized to access it'
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const roleFilter = await getTaskFilter(req.user);
        const task = await Task.findOne({ _id: req.params.id, ...roleFilter });

        if (!task) {
            return res.status(403).json({
                success: false,
                message: 'Task not found or you are not authorized to comment on it'
            });
        }

        task.comments.push({
            user: req.user._id,
            text: req.body.text
        });

        await task.save();

        const updatedTask = await Task.findById(req.params.id)
            .populate('comments.user', 'name photo');

        res.status(200).json({
            success: true,
            data: updatedTask.comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update task order (for drag-and-drop)
// @route   PUT /api/tasks/:id/order
// @access  Private
export const updateTaskOrder = async (req, res) => {
    try {
        const { order, status } = req.body;
        const roleFilter = await getTaskFilter(req.user);

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, ...roleFilter },
            { order, status },
            { new: true }
        );

        if (!task) {
            return res.status(403).json({
                success: false,
                message: 'Task not found or you are not authorized to update it'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
