import {
    crearSolicitudReparacion,
    obtenerSolicitudesPorUsuario,
    obtenerSolicitudesAbiertas,
    obtenerSolicitudPorId,
    editarDescripcionSolicitud,
    eliminarSolicitud
} from '../services/repair-request.service.js';
import { responderError } from '../errors/domain.error.js';
import { identificadorValido, validarDescripcionSolicitud } from '../validation/identifiers.js';

export async function registrarSolicitud(req, res) {
    const { dispositivoId, descripcion } = req.body ?? {};

    if (!identificadorValido(dispositivoId)) {
        return res.status(422).json({
            success: false,
            error: 'Debes indicar un identificador de dispositivo válido.'
        });
    }

    if (!validarDescripcionSolicitud(descripcion)) {
        return res.status(422).json({
            success: false,
            error: 'La descripción debe tener entre 10 y 2000 caracteres.'
        });
    }

    try {
        const solicitud = await crearSolicitudReparacion(req.auth.uid, {
            dispositivoId,
            descripcion: descripcion.trim()
        });

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                error: 'No se encontró el dispositivo entre tus registros.'
            });
        }

        return res.status(201).json({
            success: true,
            data: solicitud
        });
    } catch (error) {
        console.error('Error al crear la solicitud:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo crear la solicitud de reparación.'
        });
    }
}

export async function listarSolicitudes(req, res) {
    try {
        const solicitudes = await obtenerSolicitudesPorUsuario(req.auth.uid);

        return res.status(200).json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error al consultar las solicitudes:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudieron consultar las solicitudes.'
        });
    }
}

export async function listarSolicitudesAbiertas(req, res) {
    try {
        const solicitudes = await obtenerSolicitudesAbiertas();

        return res.status(200).json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error al consultar las solicitudes abiertas:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudieron consultar las solicitudes abiertas.'
        });
    }
}

export async function consultarSolicitud(req, res) {
    if (!identificadorValido(req.params.solicitudId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de solicitud válido.' });
    }
    try {
        const solicitud = await obtenerSolicitudPorId(req.params.solicitudId, req.auth.uid, req.user.rol);
        return res.status(200).json({ success: true, data: solicitud });
    } catch (error) {
        return responderError(res, error, 'Error al consultar la solicitud:');
    }
}

export async function editarSolicitud(req, res) {
    const { descripcion } = req.body ?? {};
    if (!validarDescripcionSolicitud(descripcion)) {
        return res.status(422).json({ success: false, error: 'La descripción debe tener entre 10 y 2000 caracteres.' });
    }
    if (!identificadorValido(req.params.solicitudId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de solicitud válido.' });
    }
    try {
        const solicitud = await editarDescripcionSolicitud(req.params.solicitudId, req.auth.uid, descripcion.trim());
        return res.status(200).json({ success: true, data: solicitud });
    } catch (error) {
        return responderError(res, error, 'Error al editar la solicitud:');
    }
}

export async function borrarSolicitud(req, res) {
    if (!identificadorValido(req.params.solicitudId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de solicitud válido.' });
    }
    try {
        await eliminarSolicitud(req.params.solicitudId, req.auth.uid);
        return res.status(200).json({ success: true, data: null });
    } catch (error) {
        return responderError(res, error, 'Error al eliminar la solicitud:');
    }
}
