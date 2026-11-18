import { createRepairRequest, getRepairRequestsByClient } from '../services/repair-request.service.js';

export async function registerRepairRequest(req, res) {
    const { deviceId, description } = req.body ?? {};

    if (typeof deviceId !== 'string' ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(deviceId)) {
        return res.status(422).json({
            success: false,
            error: 'Debes indicar un identificador de dispositivo válido.'
        });
    }

    if (typeof description !== 'string' ||
        description.trim().length < 10 ||
        description.trim().length > 2000) {
        return res.status(422).json({
            success: false,
            error: 'La descripción debe tener entre 10 y 2000 caracteres.'
        });
    }

    try {
        const repairRequest = await createRepairRequest(req.auth.uid, {
            deviceId,
            description: description.trim()
        });

        if (!repairRequest) {
            return res.status(404).json({
                success: false,
                error: 'No se encontró el dispositivo entre tus registros.'
            });
        }

        return res.status(201).json({
            success: true,
            data: repairRequest
        });
    } catch (error) {
        console.error('Error al crear la solicitud:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo crear la solicitud de reparación.'
        });
    }
}

export async function listRepairRequests(req, res) {
    try {
        const repairRequests = await getRepairRequestsByClient(req.auth.uid);

        return res.status(200).json({
            success: true,
            data: repairRequests
        });
    } catch (error) {
        console.error('Error al consultar las solicitudes:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudieron consultar las solicitudes.'
        });
    }
}