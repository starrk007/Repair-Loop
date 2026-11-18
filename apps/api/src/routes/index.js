import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { createProfile, getProfile } from '../controllers/user.controller.js';
import { registerDevice, listDevices } from '../controllers/device.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { registerRepairRequest, listRepairRequests, listOpenRepairRequests } from '../controllers/repair-request.controller.js';
import { registerTechnicianProfile, getMyTechnicianProfile } from '../controllers/technician.controller.js';

const router = Router();

router.get('/health', getHealth);

router.get('/auth/me', requireAuth, getCurrentUser);

router.post('/users/me', requireAuth, createProfile);
router.get('/users/me', requireAuth, getProfile);

router.post('/devices', requireAuth, requireRole('client'), registerDevice);
router.get('/devices', requireAuth, requireRole('client'), listDevices);

router.post('/repair-requests', requireAuth, requireRole('client'), registerRepairRequest);
router.get('/repair-requests', requireAuth, requireRole('client'), listRepairRequests);

router.post('/technicians/me', requireAuth, requireRole('technician'), registerTechnicianProfile);
router.get('/technicians/me', requireAuth, requireRole('technician'), getMyTechnicianProfile);
router.get('/repair-requests/open', requireAuth, requireRole('technician'), listOpenRepairRequests);

export default router;