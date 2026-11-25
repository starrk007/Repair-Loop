import { Router } from 'express';
import { obtenerSalud } from '../controllers/health.controller.js';
import { obtenerUsuarioActual } from '../controllers/auth.controller.js';
import { crearPerfil, obtenerPerfil } from '../controllers/user.controller.js';
import { registrarDispositivo, listarDispositivos, actualizarPrecioReemplazo } from '../controllers/device.controller.js';
import { requerirAutenticacion } from '../middleware/auth.middleware.js';
import { requerirRol } from '../middleware/role.middleware.js';
import { registrarSolicitud, listarSolicitudes, listarSolicitudesAbiertas, consultarSolicitud, editarSolicitud, borrarSolicitud } from '../controllers/repair-request.controller.js';
import { registrarPerfilTecnico, obtenerMiPerfilTecnico } from '../controllers/technician.controller.js';
import { registrarCotizacion, listarCotizacionesDeSolicitud, listarMisCotizaciones, consultarCotizacion } from '../controllers/quote.controller.js';
import { aceptar, rechazar, listar, consultar, avanzar, consultarAhorro } from '../controllers/repair.controller.js';

const router = Router();

router.get('/health', obtenerSalud);

router.get('/auth/me', requerirAutenticacion, obtenerUsuarioActual);

router.post('/users/me', requerirAutenticacion, crearPerfil);
router.get('/users/me', requerirAutenticacion, obtenerPerfil);

router.post('/devices', requerirAutenticacion, requerirRol('usuario'), registrarDispositivo);
router.get('/devices', requerirAutenticacion, requerirRol('usuario'), listarDispositivos);
router.patch('/devices/:dispositivoId/replacement-price', requerirAutenticacion, requerirRol('usuario'), actualizarPrecioReemplazo);

router.post('/repair-requests', requerirAutenticacion, requerirRol('usuario'), registrarSolicitud);
router.get('/repair-requests', requerirAutenticacion, requerirRol('usuario'), listarSolicitudes);
router.get('/repair-requests/open', requerirAutenticacion, requerirRol('tecnico'), listarSolicitudesAbiertas);
router.get('/repair-requests/:solicitudId', requerirAutenticacion, requerirRol('usuario', 'tecnico'), consultarSolicitud);
router.patch('/repair-requests/:solicitudId', requerirAutenticacion, requerirRol('usuario'), editarSolicitud);
router.delete('/repair-requests/:solicitudId', requerirAutenticacion, requerirRol('usuario'), borrarSolicitud);

router.post('/repair-requests/:solicitudId/quotes', requerirAutenticacion, requerirRol('tecnico'), registrarCotizacion);
router.get('/repair-requests/:solicitudId/quotes', requerirAutenticacion, requerirRol('usuario'), listarCotizacionesDeSolicitud);
router.get('/quotes', requerirAutenticacion, requerirRol('tecnico'), listarMisCotizaciones);
router.get('/quotes/:cotizacionId', requerirAutenticacion, requerirRol('usuario', 'tecnico'), consultarCotizacion);
router.post('/quotes/:cotizacionId/accept', requerirAutenticacion, requerirRol('usuario'), aceptar);
router.post('/quotes/:cotizacionId/reject', requerirAutenticacion, requerirRol('usuario'), rechazar);

router.get('/repairs', requerirAutenticacion, requerirRol('usuario', 'tecnico'), listar);
router.get('/repairs/:reparacionId', requerirAutenticacion, requerirRol('usuario', 'tecnico'), consultar);
router.post('/repairs/:reparacionId/status', requerirAutenticacion, requerirRol('tecnico'), avanzar);
router.get('/repairs/:reparacionId/savings', requerirAutenticacion, requerirRol('usuario', 'tecnico'), consultarAhorro);

router.post('/technicians/me', requerirAutenticacion, requerirRol('tecnico'), registrarPerfilTecnico);
router.get('/technicians/me', requerirAutenticacion, requerirRol('tecnico'), obtenerMiPerfilTecnico);

export default router;
