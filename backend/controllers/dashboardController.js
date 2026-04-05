import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Timesheet from '../models/Timesheet.js';
import Notification from '../models/Notification.js';
import {
    buildVisibilityFilter,
    getVisibleRoles,
    ROLE_LIMITS,
    canManageUsers,
    VISIBILITY_RULES
} from '../middleware/rbac.js';

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const organizationId = req.user.organization;

        let dashboardData = {};

        // Common data for all users
        const user = await User.findById(userId)
            .populate('organization', 'name')
            .select('-password');

        // Get notifications
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('relatedTo.id', 'title name');

        // Get user's tasks
        const myTasks = await Task.find({ assignedTo: userId })
            .populate('project', 'name color')
            .sort({ dueDate: 1 })
            .limit(10);

        // Get user's timesheets for current week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const timesheets = await Timesheet.find({
            user: userId,
            date: { $gte: startOfWeek }
        }).populate('project task');

        // Calculate work stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTimesheets = await Timesheet.find({
            user: userId,
            date: today,
            status: 'Approved'
        });

        const hoursToday = todayTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

        const thisWeekTimesheets = await Timesheet.find({
            user: userId,
            date: { $gte: startOfWeek },
            status: 'Approved'
        });

        const hoursThisWeek = thisWeekTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

        // Get user's projects
        const userProjects = await Project.find({
            $or: [
                { projectLead: userId },
                { 'teamMembers.user': userId }
            ],
            status: 'Active'
        })
            .populate('projectLead', 'name photo')
            .populate('teamMembers.user', 'name photo role');

        dashboardData = {
            user,
            notifications,
            myTasks,
            userProjects,
            workStats: {
                hoursToday,
                hoursThisWeek,
                workedHoursToday: req.user.currentStatus.workedHoursToday || 0,
                productiveHoursToday: req.user.currentStatus.productiveHoursToday || 0,
                isPunchedIn: req.user.currentStatus.isPunchedIn || false
            },
            attendance: req.user.attendance,
            leaveBalance: req.user.leaveBalance,
            skills: req.user.skills
        };

        // Role-specific data
        if (['Super Admin', 'Project Admin'].includes(userRole)) {
            // Admin Dashboard
            const totalProjects = await Project.countDocuments({ organization: organizationId });
            const activeProjects = await Project.countDocuments({
                organization: organizationId,
                status: 'Active'
            });
            const completedProjects = await Project.countDocuments({
                organization: organizationId,
                status: 'Completed'
            });
            const totalUsers = await User.countDocuments({ organization: organizationId });

            const allProjects = await Project.find({ organization: organizationId })
                .populate('projectLead', 'name photo')
                .populate('teamMembers.user', 'name photo role')
                .sort({ createdAt: -1 })
                .limit(10);

            dashboardData.adminStats = {
                totalProjects,
                activeProjects,
                completedProjects,
                totalUsers,
                allProjects
            };
        }

        if (['Project Manager', 'Team Lead'].includes(userRole)) {
            // PM/Lead Dashboard
            const managedProjects = await Project.find({ projectLead: userId })
                .populate('teamMembers.user', 'name photo');

            const overdueTasks = await Task.countDocuments({
                project: { $in: managedProjects.map(p => p._id) },
                status: { $ne: 'Completed' },
                dueDate: { $lt: new Date() }
            });

            dashboardData.managerStats = {
                managedProjects,
                overdueTasks
            };
        }

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Punch In/Out
// @route   POST /api/dashboard/punch
// @access  Private
export const punchInOut = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.currentStatus.isPunchedIn) {
            // Punch In
            user.currentStatus.isPunchedIn = true;
            user.currentStatus.punchInTime = new Date();
            user.currentStatus.workedHoursToday = 0;

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Punched in successfully',
                data: {
                    isPunchedIn: true,
                    punchInTime: user.currentStatus.punchInTime
                }
            });
        } else {
            // Punch Out
            const punchInTime = user.currentStatus.punchInTime;
            const punchOutTime = new Date();
            const workedHours = (punchOutTime - punchInTime) / (1000 * 60 * 60); // Convert to hours

            user.currentStatus.isPunchedIn = false;
            user.currentStatus.punchOutTime = punchOutTime;
            user.currentStatus.workedHoursToday = workedHours;

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Punched out successfully',
                data: {
                    isPunchedIn: false,
                    punchOutTime,
                    workedHours: workedHours.toFixed(2)
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get team members with pagination, search, and filtering
// @route   GET /api/dashboard/team
// @access  Private
export const getTeamMembers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            role = '',
            department = ''
        } = req.query;

        const userRole = req.user.role;
        const userId = req.user._id;

        // Build base query with organization filter
        const query = {
            organization: req.user.organization
        };

        // Apply role-based visibility filter
        if (userRole === 'Team Member') {
            // Team Members can only see themselves
            query._id = userId;
        } else if (userRole !== 'Super Admin') {
            // Other roles see based on visibility rules
            const visibleRoles = getVisibleRoles(userRole);
            if (visibleRoles.length > 0) {
                query.role = { $in: visibleRoles };
            } else {
                query._id = userId;
            }
        }
        // Super Admin sees everyone (no additional filter)

        // Search filter (name, role, department)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        }

        // Role filter (only allow filtering to visible roles)
        if (role && role !== 'All') {
            const visibleRoles = userRole === 'Super Admin'
                ? Object.keys(ROLE_LIMITS)
                : getVisibleRoles(userRole);
            if (visibleRoles.includes(role)) {
                query.role = role;
            }
        }

        // Department filter
        if (department && department !== 'All') {
            query.department = department;
        }

        // Get total count for pagination
        const totalCount = await User.countDocuments(query);
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        // Fetch team members with pagination
        const teamMembers = await User.find(query)
            .select('name email phone role designation department photo isActive joiningDate')
            .sort({ name: 1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        // Get all users for role counts (with visibility filter)
        const allVisibleUsers = await User.find({
            organization: req.user.organization,
            ...(userRole === 'Super Admin' ? {} : { role: { $in: getVisibleRoles(userRole) } })
        }).select('role');

        // Calculate role counts
        const roleCounts = {};
        Object.keys(ROLE_LIMITS).forEach(r => {
            roleCounts[r] = {
                current: allVisibleUsers.filter(u => u.role === r).length,
                limit: ROLE_LIMITS[r]
            };
        });

        // Get unique departments for filter dropdown
        const allDepartments = await User.distinct('department', {
            organization: req.user.organization,
            department: { $exists: true, $ne: null, $ne: '' }
        });

        // Get visible roles for filter dropdown
        const visibleRolesForFilter = userRole === 'Super Admin'
            ? Object.keys(ROLE_LIMITS)
            : getVisibleRoles(userRole);

        res.status(200).json({
            success: true,
            data: teamMembers,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCount,
                hasMore: parseInt(page) < totalPages
            },
            filters: {
                departments: allDepartments,
                roles: visibleRolesForFilter
            },
            roleCounts,
            permissions: {
                canManageUsers: canManageUsers(userRole),
                canViewAll: userRole === 'Super Admin',
                userRole
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get detailed member profile with tasks and projects
// @route   GET /api/dashboard/team/:id
// @access  Private
export const getMemberProfile = async (req, res) => {
    try {
        const memberId = req.params.id;

        // Get member details
        const member = await User.findById(memberId)
            .select('name email phone role designation department photo isActive joiningDate skills');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Get assigned tasks
        const assignedTasks = await Task.find({ assignedTo: memberId })
            .select('title status priority dueDate project')
            .populate('project', 'name color')
            .sort({ dueDate: 1 })
            .limit(10);

        // Get assigned projects
        const assignedProjects = await Project.find({
            $or: [
                { projectLead: memberId },
                { 'teamMembers.user': memberId }
            ]
        })
            .select('name status color description')
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                member,
                assignedTasks,
                assignedProjects
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get upcoming birthdays
// @route   GET /api/dashboard/birthdays
// @access  Private
export const getUpcomingBirthdays = async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const users = await User.find({
            organization: req.user.organization,
            isActive: true,
            dob: { $exists: true, $ne: null }
        }).select('name role photo dob');

        // Filter users with birthdays in the next 7 days
        const upcomingBirthdays = users.filter(user => {
            const dobMonth = user.dob.getMonth();
            const dobDay = user.dob.getDate();

            if (dobMonth === currentMonth) {
                return dobDay >= currentDay && dobDay <= currentDay + 7;
            }

            return false;
        }).sort((a, b) => a.dob.getDate() - b.dob.getDate());

        res.status(200).json({
            success: true,
            data: upcomingBirthdays
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create new team member
// @route   POST /api/dashboard/team
// @access  Private (Super Admin only)
export const createTeamMember = async (req, res) => {
    try {
        // Only Super Admin can create users
        if (!canManageUsers(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can add team members'
            });
        }

        const { name, email, password, phone, role, department, designation } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Validate role is allowed
        const validRoles = Object.keys(ROLE_LIMITS);
        const assignedRole = role || 'Team Member';
        if (!validRoles.includes(assignedRole)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`
            });
        }

        // Check role limit
        const currentRoleCount = await User.countDocuments({
            organization: req.user.organization,
            role: assignedRole
        });

        const roleLimit = ROLE_LIMITS[assignedRole];
        if (currentRoleCount >= roleLimit) {
            return res.status(400).json({
                success: false,
                message: `This project already has a ${assignedRole}. Limit: ${roleLimit}`
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new team member
        const newMember = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: assignedRole,
            department: department || '',
            designation: designation || '',
            organization: req.user.organization,
            isActive: true
        });

        // Return the new member without password
        const member = await User.findById(newMember._id)
            .select('name email phone role designation department photo isActive joiningDate');

        res.status(201).json({
            success: true,
            message: 'Team member created successfully',
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
