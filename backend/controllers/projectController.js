import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const query = {
            organization: req.user.organization
        };

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        // For non-admin users, only show their projects
        if (!['Super Admin', 'Project Admin'].includes(req.user.role)) {
            query.$or = [
                { projectLead: req.user._id },
                { 'teamMembers.user': req.user._id }
            ];
        }

        const projects = await Project.find(query)
            .populate('projectLead', 'name photo email')
            .populate('teamMembers.user', 'name photo')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate progress and totalTasks for each project dynamically
        const projectsWithProgress = await Promise.all(
            projects.map(async (project) => {
                const tasks = await Task.find({ project: project._id });
                const totalTasks = tasks.length;
                const doneTasks = tasks.filter(t => t.status === 'Done').length;
                const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return {
                    ...project,
                    totalTasks,
                    progress
                };
            })
        );

        res.status(200).json({
            success: true,
            count: projectsWithProgress.length,
            data: projectsWithProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('projectLead', 'name photo email phone designation')
            .populate('teamMembers.user', 'name photo email role')
            .populate('organization', 'name');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private  (Admin, PM)
export const createProject = async (req, res) => {
    try {
        req.body.organization = req.user.organization;
        req.body.projectLead = req.body.projectLead || req.user._id;

        const project = await Project.create(req.body);

        // Create notification for project lead
        if (req.body.projectLead.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: req.body.projectLead,
                type: 'Project Update',
                title: 'New Project Assigned',
                message: `You have been assigned as project lead for "${project.name}"`,
                link: `/projects/${project._id}`,
                relatedTo: {
                    model: 'Project',
                    id: project._id
                }
            });
        }

        const populatedProject = await Project.findById(project._id)
            .populate('projectLead', 'name photo email')
            .populate('teamMembers.user', 'name photo');

        res.status(201).json({
            success: true,
            data: populatedProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, PM, Project Lead)
export const updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Authorization check: Super Admin or Assigned Project Lead (PM)
        const isSuperAdmin = req.user.role === 'Super Admin';
        const isProjectLead = project.projectLead.toString() === req.user._id.toString() && req.user.role === 'Project Manager';

        if (!isSuperAdmin && !isProjectLead) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Only the assigned Project Manager or Super Admin can edit this project'
            });
        }


        project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('projectLead', 'name photo email')
            .populate('teamMembers.user', 'name photo');

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only Super Admin can delete projects
        if (req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Only Super Admin can delete projects'
            });
        }


        await project.deleteOne();

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

// @desc    Add team member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin, PM, Project Lead)
export const addTeamMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Authorization check: Super Admin or Assigned Project Lead (PM)
        const isSuperAdmin = req.user.role === 'Super Admin';
        const isProjectLead = project.projectLead.toString() === req.user._id.toString() && req.user.role === 'Project Manager';

        if (!isSuperAdmin && !isProjectLead) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Only the assigned Project Manager or Super Admin can manage members'
            });
        }


        const { userId, role } = req.body;

        // Check if user already in team
        const alreadyMember = project.teamMembers.some(
            member => member.user.toString() === userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a team member'
            });
        }

        project.teamMembers.push({ user: userId, role });
        await project.save();

        // Create notification for new member
        await Notification.create({
            user: userId,
            type: 'Project Update',
            title: 'Added to Project',
            message: `You have been added to project "${project.name}"`,
            link: `/projects/${project._id}`,
            relatedTo: {
                model: 'Project',
                id: project._id
            }
        });

        const updatedProject = await Project.findById(project._id)
            .populate('projectLead', 'name photo')
            .populate('teamMembers.user', 'name photo');

        res.status(200).json({
            success: true,
            data: updatedProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin, PM, Project Lead)
export const removeTeamMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Authorization check: Super Admin or Assigned Project Lead (PM)
        const isSuperAdmin = req.user.role === 'Super Admin';
        const isProjectLead = project.projectLead.toString() === req.user._id.toString() && req.user.role === 'Project Manager';

        if (!isSuperAdmin && !isProjectLead) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: Only the assigned Project Manager or Super Admin can manage members'
            });
        }


        project.teamMembers = project.teamMembers.filter(
            member => member.user.toString() !== req.params.userId
        );

        await project.save();

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
