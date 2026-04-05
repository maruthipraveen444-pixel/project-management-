import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getMessagingSettings,
    updateMessagingSettings
} from '../controllers/settingsController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Messaging settings routes
router.get('/messaging', getMessagingSettings);
router.put('/messaging', updateMessagingSettings);

export default router;
