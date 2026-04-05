import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorize, checkOrganization } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);
router.use(checkOrganization);

router
    .route('/')
    .get(getProjects)
    .post(authorize('Super Admin', 'Project Admin', 'Project Manager'), createProject);

router
    .route('/:id')
    .get(getProject)
    .put(authorize('Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'), updateProject)
    .delete(authorize('Super Admin', 'Project Admin'), deleteProject);

router.post('/:id/members', authorize('Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'), addTeamMember);
router.delete('/:id/members/:userId', authorize('Super Admin', 'Project Admin', 'Project Manager', 'Team Lead'), removeTeamMember);

export default router;
