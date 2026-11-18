import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { createProfile, getProfile } from '../controllers/user.controller.js';
import { registerDevice, listDevices } from '../controllers/device.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { registerRepairRequest, listRepairRequests } from '../controllers/repair-request.controller.js';

const router = Router();

router.get('/health', getHealth);

router.get('/auth/me', requireAuth, getCurrentUser);

router.post('/users/me', requireAuth, createProfile);
router.get('/users/me', requireAuth, getProfile);

router.post('/devices', requireAuth, requireRole('client'), registerDevice);
router.get('/devices', requireAuth, requireRole('client'), listDevices);

router.post('/repair-requests', requireAuth, requireRole('client'), registerRepairRequest);
router.get('/repair-requests', requireAuth, requireRole('client'), listRepairRequests);

export default router;