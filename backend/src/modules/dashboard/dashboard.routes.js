import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.middleware.js';
import { dashboard } from './dashboard.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', dashboard);

export default router;
