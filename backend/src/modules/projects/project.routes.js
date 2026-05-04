import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { requireProjectMember } from '../../middleware/require-project-member.middleware.js';
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listMembers,
  listMyProjects,
  removeMember,
  updateMemberRole,
  updateProject,
} from './project.controller.js';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from './task.controller.js';
import { projectDashboard } from '../dashboard/dashboard.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listMyProjects);
router.post(
  '/',
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().isString().isLength({ max: 2000 }),
  ],
  createProject
);

router.get('/:id', requireProjectMember(), getProject);
router.get('/:id/dashboard', requireProjectMember(), projectDashboard);
router.patch(
  '/:id',
  requireProjectMember({ adminOnly: true }),
  [
    body('name').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().isString().isLength({ max: 2000 }),
  ],
  updateProject
);
router.delete('/:id', requireProjectMember({ adminOnly: true }), deleteProject);

router.get('/:id/members', requireProjectMember(), listMembers);
router.post(
  '/:id/members',
  requireProjectMember({ adminOnly: true }),
  [
    body('email').isEmail().normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MEMBER']),
  ],
  addMember
);
router.patch(
  '/:id/members/:userId',
  requireProjectMember({ adminOnly: true }),
  [body('role').isIn(['ADMIN', 'MEMBER'])],
  updateMemberRole
);
router.delete(
  '/:id/members/:userId',
  requireProjectMember({ adminOnly: true }),
  removeMember
);

router.get('/:id/tasks', requireProjectMember(), listTasks);
router.post(
  '/:id/tasks',
  requireProjectMember(),
  [
    body('title').trim().notEmpty().isLength({ max: 300 }),
    body('description').optional().isString().isLength({ max: 5000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('assigneeId').optional().isMongoId(),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  createTask
);
router.get('/:id/tasks/:taskId', requireProjectMember(), getTask);
router.patch(
  '/:id/tasks/:taskId',
  requireProjectMember(),
  [
    body('title').optional().trim().notEmpty().isLength({ max: 300 }),
    body('description').optional().isString().isLength({ max: 5000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('assigneeId')
      .optional({ values: 'null' })
      .custom((v) => v === '' || typeof v !== 'string' || /^[a-f\d]{24}$/i.test(v)),
    body('dueDate')
      .optional({ values: 'null' })
      .custom((v) => v === '' || v instanceof Date || !Number.isNaN(Date.parse(String(v)))),
  ],
  updateTask
);
router.delete('/:id/tasks/:taskId', requireProjectMember(), deleteTask);

export default router;
