import {
    aceptarCotizacion,
    rechazarCotizacion,
    obtenerReparaciones,
    obtenerReparacion,
    avanzarReparacion,
    obtenerAhorro
} from '../services/repair.service.js';
import { responderError } from '../errors/domain.error.js';
import { identificadorValido } from '../validation/identifiers.js';
import { validarAvanceReparacion } from '../validation/repair.validation.js';

function validarId(res, valor, etiqueta) {
    if (!identificadorValido(valor)) {
        res.status(422).json({ success: false, error: `Debes indicar un identificador de ${etiqueta} válido.` });
        return false;
    }
    return true;
}

export async function aceptar(req, res) {
    if (!validarId(res, req.params.cotizacionId, 'cotización')) return;
    try {
        const reparacion = await aceptarCotizacion(req.params.cotizacionId, req.auth.uid);
        return res.status(200).json({ success: true, data: reparacion });
    } catch (error) {
        return responderError(res, error, 'Error al aceptar la cotización:');
    }
}

export async function rechazar(req, res) {
    if (!validarId(res, req.params.cotizacionId, 'cotización')) return;
    try {
        await rechazarCotizacion(req.params.cotizacionId, req.auth.uid);
        return res.status(200).json({ success: true, data: null });
    } catch (error) {
        return responderError(res, error, 'Error al rechazar la cotización:');
    }
}

export async function listar(req, res) {
    try {
        const reparaciones = await obtenerReparaciones(req.auth.uid, req.user.rol);
        return res.status(200).json({ success: true, data: reparaciones });
    } catch (error) {
        return responderError(res, error, 'Error al consultar las reparaciones:');
    }
}

export async function consultar(req, res) {
    if (!validarId(res, req.params.reparacionId, 'reparación')) return;
    try {
        const reparacion = await obtenerReparacion(req.params.reparacionId, req.auth.uid, req.user.rol);
        return res.status(200).json({ success: true, data: reparacion });
    } catch (error) {
        return responderError(res, error, 'Error al consultar la reparación:');
    }
}

export async function avanzar(req, res) {
    if (!validarId(res, req.params.reparacionId, 'reparación')) return;
    try {
        const datos = validarAvanceReparacion(req.body?.estado, req.body?.observacion);
        const reparacion = await avanzarReparacion(
            req.params.reparacionId,
            req.auth.uid,
            datos.estado,
            datos.observacion
        );
        return res.status(200).json({ success: true, data: reparacion });
    } catch (error) {
        return responderError(res, error, 'Error al avanzar la reparación:');
    }
}

export async function consultarAhorro(req, res) {
    if (!validarId(res, req.params.reparacionId, 'reparación')) return;
    try {
        const ahorro = await obtenerAhorro(req.params.reparacionId, req.auth.uid, req.user.rol);
        return res.status(200).json({ success: true, data: ahorro });
    } catch (error) {
        return responderError(res, error, 'Error al calcular el ahorro:');
    }
}
