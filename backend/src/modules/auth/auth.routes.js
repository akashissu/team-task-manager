import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register } from './auth.controller.js';
import { requireAuth } from '../../middleware/require-auth.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
    body('name').trim().notEmpty().isLength({ max: 120 }),
  ],
  register
);
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);
router.get('/me', requireAuth, me);

export default router;
