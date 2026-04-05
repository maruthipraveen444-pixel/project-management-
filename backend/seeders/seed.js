import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Organization.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();
        await Notification.deleteMany();

        console.log('Data cleared...');

        // Step 1: Create temporary admin user without organization
        const tempAdmin = await User.create({
            name: 'Jonathan Powell',
            email: 'jonathan@acme.com',
            password: 'password123',
            role: 'Super Admin',
            designation: 'Chief Product Designer',
            department: 'UI/UX Design',
            phone: '333 2463458',
            dob: new Date('1990-04-15'),
            address: 'Dujiia Marta',
            bloodGroup: 'A+',
            joiningDate: new Date('2020-01-15'),
            skills: [
                { name: 'Figma', proficiency: 95 },
                { name: 'HTML', proficiency: 92 },
                { name: 'CSS', proficiency: 88 },
                { name: 'JavaScript', proficiency: 85 }
            ],
            leaveBalance: { total: 20, taken: 6, lossOfPay: 0 },
            attendance: {
                onTime: 186,
                late: 10,
                wfh: 15,
                absent: 3,
                sickLeave: 2,
                workedDays: 240
            }
        });

        // Step 2: Create organization with tempAdmin as creator
        const org = await Organization.create({
            name: 'Acme Corporation',
            description: 'Leading software development company',
            createdBy: tempAdmin._id,
            members: [{ user: tempAdmin._id }]
        });

        // Step 3: Update tempAdmin with organization
        tempAdmin.organization = org._id;
        await tempAdmin.save();

        // Step 4: Create other users
        const user1 = await User.create({
            name: 'Anthony Lewis',
            email: 'anthony@acme.com',
            password: 'password123',
            role: 'Project Manager',
            designation: 'Project Manager',
            department: 'Management',
            organization: org._id,
            skills: [
                { name: 'Project Management', proficiency: 90 },
                { name: 'Leadership', proficiency: 85 }
            ]
        });

        const user2 = await User.create({
            name: 'Brian Villalobos',
            email: 'brian@acme.com',
            password: 'password123',
            role: 'Team Lead',
            designation: 'Senior Developer',
            department: 'Engineering',
            organization: org._id
        });

        const user3 = await User.create({
            name: 'Troy Marie',
            email: 'troy@acme.com',
            password: 'password123',
            role: 'Team Member',
            designation: 'Frontend Developer',
            department: 'Engineering',
            organization: org._id,
            dob: new Date('1995-02-' + new Date().getDate())
        });

        const user4 = await User.create({
            name: 'Harvey Smith',
            email: 'harvey@acme.com',
            password: 'password123',
            role: 'Team Member',
            designation: 'Backend Developer',
            department: 'Engineering',
            organization: org._id
        });

        const user5 = await User.create({
            name: 'Andrew James',
            email: 'andrew@acme.com',
            password: 'password123',
            role: 'Team Member',
            designation: 'Product Lead',
            department: 'Product',
            organization: org._id,
            dob: new Date('1993-02-' + (new Date().getDate() + 2))
        });

        // Step 5: Update organization members
        org.members.push(
            { user: user1._id },
            { user: user2._id },
            { user: user3._id },
            { user: user4._id },
            { user: user5._id }
        );
        await org.save();

        // Step 6: Create projects
        const project1 = await Project.create({
            name: 'Office Management',
            description: 'Internal office management system',
            organization: org._id,
            status: 'Active',
            priority: 'High',
            currentMilestone: 'Development',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-06-30'),
            projectLead: user1._id,
            teamMembers: [
                { user: user2._id, role: 'Developer' },
                { user: user3._id, role: 'Developer' },
                { user: user4._id, role: 'Developer' }
            ],
            progress: 60,
            totalTasks: 15,
            completedTasks: 9,
            estimatedHours: 500,
            timeSpent: 328,
            color: '#3B82F6'
        });

        const project2 = await Project.create({
            name: 'E-commerce Platform',
            description: 'Customer-facing e-commerce application',
            organization: org._id,
            status: 'Active',
            priority: 'Critical',
            currentMilestone: 'Planning',
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-08-31'),
            projectLead: user1._id,
            teamMembers: [
                { user: user2._id, role: 'Lead Developer' },
                { user: user4._id, role: 'Backend Developer' }
            ],
            progress: 30,
            totalTasks: 20,
            completedTasks: 6,
            estimatedHours: 800,
            timeSpent: 240,
            color: '#10B981'
        });

        const project3 = await Project.create({
            name: 'Mobile App Development',
            description: 'Cross-platform mobile application',
            organization: org._id,
            status: 'Completed',
            priority: 'Medium',
            currentMilestone: 'Deployment',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-12-31'),
            projectLead: user1._id,
            teamMembers: [
                { user: user3._id, role: 'Mobile Developer' }
            ],
            progress: 100,
            totalTasks: 25,
            completedTasks: 25,
            estimatedHours: 600,
            timeSpent: 632,
            color: '#8B5CF6'
        });

        // Step 7: Create tasks
        await Task.create([
            {
                title: 'Patient appointment booking',
                description: 'Implement appointment booking feature',
                project: project1._id,
                assignedTo: [user3._id, user4._id],
                createdBy: user1._id,
                status: 'In Progress',
                priority: 'High',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                estimatedHours: 24
            },
            {
                title: 'Appointment booking with payment',
                description: 'Integrate payment gateway with booking',
                project: project1._id,
                assignedTo: [user4._id],
                createdBy: user1._id,
                status: 'In Progress',
                priority: 'Medium',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                estimatedHours: 16
            },
            {
                title: 'Patient and Doctor video conferencing',
                description: 'Implement video call functionality',
                project: project1._id,
                assignedTo: [user2._id, user3._id],
                createdBy: user1._id,
                status: 'In Progress',
                priority: 'High',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                estimatedHours: 40
            },
            {
                title: 'Private chat module',
                description: 'Build chat system for patient-doctor communication',
                project: project1._id,
                assignedTo: [user3._id, user4._id],
                createdBy: user1._id,
                status: 'Open',
                priority: 'Medium',
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                estimatedHours: 32
            },
            {
                title: 'Gas and Pool Implementation',
                description: 'Implement utility features',
                project: project1._id,
                assignedTo: [user4._id],
                createdBy: user1._id,
                status: 'Open',
                priority: 'Low',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                estimatedHours: 20
            }
        ]);

        // Step 8: Create notifications
        await Notification.create([
            {
                user: tempAdmin._id,
                type: 'File Uploaded',
                title: 'New Document Uploaded',
                message: 'Troy Marie submitted the employee review',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                user: tempAdmin._id,
                type: 'Leave Request',
                title: 'Leave Request Pending',
                message: 'Linda Ray request leave on 08 Oct 2024',
                priority: 'High',
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                user: tempAdmin._id,
                type: 'Meeting Scheduled',
                title: 'Meeting Scheduled',
                message: 'Harvey Smith requested access to UNIX',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            {
                user: tempAdmin._id,
                type: 'Comment Added',
                title: 'New Comment',
                message: 'Tony Villalobos scheduled a new meeting today at 5:00 PM',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                user: tempAdmin._id,
                type: 'Task Completed',
                title: 'Task Completed',
                message: 'Anthony Lewis archived old company excel sheets',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ]);

        console.log('✅ Sample data created successfully!');
        console.log('\n🔐 Login Credentials:');
        console.log('==================');
        console.log('Super Admin:');
        console.log('  Email: jonathan@acme.com');
        console.log('  Password: password123');
        console.log('\nProject Manager:');
        console.log('  Email: anthony@acme.com');
        console.log('  Password: password123');
        console.log('\nTeam Member:');
        console.log('  Email: troy@acme.com');
        console.log('  Password: password123\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
