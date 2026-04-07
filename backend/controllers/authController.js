import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register user & create organization
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, organizationName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // 1. Create user first (temporarily without organization)
        const user = await User.create({
            name,
            email,
            password,
            role: 'Super Admin'
        });

        // 2. Create organization with the user as creator
        const organization = await Organization.create({
            name: organizationName,
            createdBy: user._id,
            members: [{ user: user._id }]
        });

        // 3. Update user with organization ID
        user.organization = organization._id;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: {
                    id: organization._id,
                    name: organization.name
                }
            }
        });
    } catch (error) {
        // If error occurs, cleanup created user if exists
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user (include password field)
        const user = await User.findOne({ email }).select('+password').populate('organization', 'name');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photo: user.photo,
                organization: user.organization
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('organization', 'name logo')
            .select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Seed the database with default accounts
// @route   GET /api/auth/seed
// @access  Public
export const seedDB = async (req, res) => {
    try {
        // Find existing Super Admin
        const adminEmail = 'jonathan@acme.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            return res.status(200).json({
                success: true,
                message: 'Database already has accounts!'
            });
        }

        // 1. Create Super Admin
        const admin = await User.create({
            name: 'Jonathan Powell',
            email: adminEmail,
            password: 'password123',
            role: 'Super Admin',
            designation: 'Chief Product Designer',
            department: 'UI/UX Design'
        });

        // 2. Create organization
        const org = await Organization.create({
            name: 'Acme Pro Corp',
            createdBy: admin._id,
            members: [{ user: admin._id }]
        });

        // 3. Link admin to org
        admin.organization = org._id;
        await admin.save();

        // 4. Create Manager & Employee
        await User.create({
            name: 'Anthony Manager',
            email: 'anthony@acme.com',
            password: 'password123',
            role: 'Project Manager',
            organization: org._id
        });

        await User.create({
            name: 'Troy Member',
            email: 'troy@acme.com',
            password: 'password123',
            role: 'Team Member',
            organization: org._id
        });

        res.status(200).json({
            success: true,
            message: '🚀 Cloud seeded with default roles successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Seeding failed',
            error: error.message
        });
    }
};
