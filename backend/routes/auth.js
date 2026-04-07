import express from 'express';
import {
    register,
    login,
    getMe,
    logout,
    updatePassword,
    seedDB
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/seed', seedDB); // New hidden seeding route

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);

export default router;
