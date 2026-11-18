import {
    createDevice,
    getDevicesByOwner
} from '../services/device.service.js';

export async function registerDevice(req, res) {
    const { type, brand, model } = req.body ?? {};

    const fields = [
        { value: type, label: 'tipo' },
        { value: brand, label: 'marca' },
        { value: model, label: 'modelo' }
    ];

    for (const field of fields) {
        if (typeof field.value !== 'string' ||
            field.value.trim().length < 1 ||
            field.value.trim().length > 100) {
            return res.status(422).json({
                success: false,
                error: `El campo ${field.label} debe tener entre 1 y 100 caracteres.`
            });
        }
    }

    try {
        const device = await createDevice(req.auth.uid, {
            type: type.trim(),
            brand: brand.trim(),
            model: model.trim()
        });

        return res.status(201).json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('Error al registrar el dispositivo:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo registrar el dispositivo.'
        });
    }
}

export async function listDevices(req, res) {
    try {
        const devices = await getDevicesByOwner(req.auth.uid);

        return res.status(200).json({
            success: true,
            data: devices
        });
    } catch (error) {
        console.error('Error al consultar los dispositivos:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudieron consultar los dispositivos.'
        });
    }
}