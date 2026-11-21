import { Router } from 'express';
import { obtenerSalud } from '../controllers/health.controller.js';
import { obtenerUsuarioActual } from '../controllers/auth.controller.js';
import { crearPerfil, obtenerPerfil } from '../controllers/user.controller.js';
import { registrarDispositivo, listarDispositivos } from '../controllers/device.controller.js';
import { requerirAutenticacion } from '../middleware/auth.middleware.js';
import { requerirRol } from '../middleware/role.middleware.js';
import { registrarSolicitud, listarSolicitudes, listarSolicitudesAbiertas } from '../controllers/repair-request.controller.js';
import { registrarPerfilTecnico, obtenerMiPerfilTecnico } from '../controllers/technician.controller.js';

const router = Router();

router.get('/health', obtenerSalud);

router.get('/auth/me', requerirAutenticacion, obtenerUsuarioActual);

router.post('/users/me', requerirAutenticacion, crearPerfil);
router.get('/users/me', requerirAutenticacion, obtenerPerfil);

router.post('/devices', requerirAutenticacion, requerirRol('usuario'), registrarDispositivo);
router.get('/devices', requerirAutenticacion, requerirRol('usuario'), listarDispositivos);

router.post('/repair-requests', requerirAutenticacion, requerirRol('usuario'), registrarSolicitud);
router.get('/repair-requests', requerirAutenticacion, requerirRol('usuario'), listarSolicitudes);

router.post('/technicians/me', requerirAutenticacion, requerirRol('tecnico'), registrarPerfilTecnico);
router.get('/technicians/me', requerirAutenticacion, requerirRol('tecnico'), obtenerMiPerfilTecnico);
router.get('/repair-requests/open', requerirAutenticacion, requerirRol('tecnico'), listarSolicitudesAbiertas);

export default router;
