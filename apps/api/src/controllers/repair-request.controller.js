import {
    crearSolicitudReparacion,
    obtenerSolicitudesPorUsuario,
    obtenerSolicitudesAbiertas
} from '../services/repair-request.service.js';

export async function registrarSolicitud(req, res) {
    const { dispositivoId, descripcion } = req.body ?? {};

    if (typeof dispositivoId !== 'string' ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(dispositivoId)) {
        return res.status(422).json({
            success: false,
            error: 'Debes indicar un identificador de dispositivo válido.'
        });
    }

    if (typeof descripcion !== 'string' ||
        descripcion.trim().length < 10 ||
        descripcion.trim().length > 2000) {
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
