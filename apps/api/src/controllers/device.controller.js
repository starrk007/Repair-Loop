import {
    crearDispositivo,
    obtenerDispositivosPorPropietario,
    establecerPrecioReemplazo
} from '../services/device.service.js';
import { identificadorValido } from '../validation/identifiers.js';
import { validarPrecioReemplazo } from '../validation/money.validation.js';
import { responderError } from '../errors/domain.error.js';

export async function registrarDispositivo(req, res) {
    const { tipo, marca, modelo } = req.body ?? {};

    const campos = [
        { valor: tipo, etiqueta: 'tipo' },
        { valor: marca, etiqueta: 'marca' },
        { valor: modelo, etiqueta: 'modelo' }
    ];

    for (const campo of campos) {
        if (typeof campo.valor !== 'string' ||
            campo.valor.trim().length < 1 ||
            campo.valor.trim().length > 100) {
            return res.status(422).json({
                success: false,
                error: `El campo ${campo.etiqueta} debe tener entre 1 y 100 caracteres.`
            });
        }
    }

    let precioReemplazo;
    if (req.body?.precioReemplazo !== undefined) {
        try {
            precioReemplazo = validarPrecioReemplazo(req.body.precioReemplazo);
        } catch (error) {
            return responderError(res, error, 'Error al validar el precio de reemplazo:');
        }
    }

    try {
        const dispositivo = await crearDispositivo(req.auth.uid, {
            tipo: tipo.trim(),
            marca: marca.trim(),
            modelo: modelo.trim(),
            precioReemplazo
        });

        return res.status(201).json({
            success: true,
            data: dispositivo
        });
    } catch (error) {
        console.error('Error al registrar el dispositivo:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo registrar el dispositivo.'
        });
    }
}

export async function actualizarPrecioReemplazo(req, res) {
    if (!identificadorValido(req.params.dispositivoId) ||
        !req.body || Object.keys(req.body).length !== 1 ||
        !Object.prototype.hasOwnProperty.call(req.body, 'precioReemplazo')) {
        return res.status(422).json({
            success: false,
            error: 'Solo puedes establecer un precio de reemplazo válido.'
        });
    }

    try {
        const precioReemplazo = validarPrecioReemplazo(req.body.precioReemplazo);
        const dispositivo = await establecerPrecioReemplazo(
            req.params.dispositivoId,
            req.auth.uid,
            precioReemplazo
        );
        if (dispositivo === null) {
            return res.status(404).json({ success: false, error: 'No se encontró el dispositivo.' });
        }
        if (dispositivo === false) {
            return res.status(403).json({ success: false, error: 'No tienes permisos para modificar este dispositivo.' });
        }
        return res.status(200).json({ success: true, data: dispositivo });
    } catch (error) {
        return responderError(res, error, 'Error al actualizar el precio de reemplazo:');
    }
}

export async function listarDispositivos(req, res) {
    try {
        const dispositivos = await obtenerDispositivosPorPropietario(req.auth.uid);

        return res.status(200).json({
            success: true,
            data: dispositivos
        });
    } catch (error) {
        console.error('Error al consultar los dispositivos:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudieron consultar los dispositivos.'
        });
    }
}
