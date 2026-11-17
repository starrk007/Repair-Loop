import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { createProfile, getProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/health', getHealth);

router.get('/auth/me', requireAuth, getCurrentUser);

router.post('/users/me', requireAuth, createProfile);
router.get('/users/me', requireAuth, getProfile);

export default router;