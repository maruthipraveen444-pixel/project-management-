import express from 'express';
import {
    getDashboardData,
    punchInOut,
    getTeamMembers,
    getMemberProfile,
    createTeamMember,
    getUpcomingBirthdays
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardData);
router.post('/punch', protect, punchInOut);
router.get('/team', protect, getTeamMembers);
router.post('/team', protect, createTeamMember);
router.get('/team/:id', protect, getMemberProfile);
router.get('/birthdays', protect, getUpcomingBirthdays);

export default router;
