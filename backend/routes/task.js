import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    updateTaskOrder
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getTasks)
    .post(authorize('Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'), createTask);

router
    .route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(authorize('Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'), deleteTask);

router.post('/:id/comments', addComment);
router.put('/:id/order', updateTaskOrder);

export default router;
