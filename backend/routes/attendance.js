import express from 'express';
import {
    punchInOut,
    getAttendanceRecords,
    getTodayAttendance,
    exportAttendance,
    updateBreakTime
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Punch in/out
router.post('/punch', punchInOut);

// Get attendance records (with filters)
router.get('/', getAttendanceRecords);

// Get today's attendance
router.get('/today', getTodayAttendance);

// Export attendance report
router.get('/export', exportAttendance);

// Update break time
router.put('/break', updateBreakTime);

export default router;
