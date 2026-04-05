import express from 'express';
import {
    getActivityLogs,
    getProjectActivity,
    getMyActivity,
    getActivitySummary,
    exportActivityLogs
} from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get activity logs (with filters)
router.get('/', getActivityLogs);

// Get my activity
router.get('/my', getMyActivity);

// Get activity summary (for dashboard)
router.get('/summary', getActivitySummary);

// Export activity logs
router.get('/export', exportActivityLogs);

// Get activity for a specific project
router.get('/project/:projectId', getProjectActivity);

export default router;
