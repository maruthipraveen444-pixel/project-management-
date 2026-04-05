import express from 'express';
import {
    createIssue,
    getAllIssues,
    updateIssueAssignee,
    updateIssueStatus,
    getIssueStats
} from '../controllers/issueController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, createIssue)
    .get(protect, getAllIssues);

router.route('/stats')
    .get(protect, getIssueStats);

router.route('/:id/assign')
    .put(protect, updateIssueAssignee);

router.route('/:id/status')
    .put(protect, updateIssueStatus);

export default router;
