import { crearCotizacion, obtenerCotizacion, obtenerCotizacionesPorSolicitud, obtenerCotizacionesPorTecnico } from '../services/quote.service.js';
import { responderError } from '../errors/domain.error.js';
import { identificadorValido } from '../validation/identifiers.js';
import { validarDatosCotizacion } from '../validation/quote.validation.js';

export async function registrarCotizacion(req, res) {
    if (!identificadorValido(req.params.solicitudId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de solicitud válido.' });
    }
    try {
        const datos = validarDatosCotizacion(req.body);
        const cotizacion = await crearCotizacion(req.auth.uid, req.params.solicitudId, datos);
        return res.status(201).json({ success: true, data: cotizacion });
    } catch (error) {
        return responderError(res, error, 'Error al crear la cotización:');
    }
}

export async function listarCotizacionesDeSolicitud(req, res) {
    if (!identificadorValido(req.params.solicitudId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de solicitud válido.' });
    }
    try {
        const cotizaciones = await obtenerCotizacionesPorSolicitud(req.params.solicitudId, req.auth.uid);
        return res.status(200).json({ success: true, data: cotizaciones });
    } catch (error) {
        return responderError(res, error, 'Error al consultar las cotizaciones:');
    }
}

export async function listarMisCotizaciones(req, res) {
    try {
        const cotizaciones = await obtenerCotizacionesPorTecnico(req.auth.uid);
        return res.status(200).json({ success: true, data: cotizaciones });
    } catch (error) {
        return responderError(res, error, 'Error al consultar tus cotizaciones:');
    }
}

export async function consultarCotizacion(req, res) {
    if (!identificadorValido(req.params.cotizacionId)) {
        return res.status(422).json({ success: false, error: 'Debes indicar un identificador de cotización válido.' });
    }
    try {
        const cotizacion = await obtenerCotizacion(req.params.cotizacionId, req.auth.uid, req.user.rol);
        return res.status(200).json({ success: true, data: cotizacion });
    } catch (error) {
        return responderError(res, error, 'Error al consultar la cotización:');
    }
}
