import {
    crearDispositivo,
    obtenerDispositivosPorPropietario
} from '../services/device.service.js';

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

    try {
        const dispositivo = await crearDispositivo(req.auth.uid, {
            tipo: tipo.trim(),
            marca: marca.trim(),
            modelo: modelo.trim()
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