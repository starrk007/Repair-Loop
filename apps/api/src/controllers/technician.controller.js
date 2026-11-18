import { createTechnicianProfile, getTechnicianProfile } from '../services/technician.service.js';

export async function registerTechnicianProfile(req, res) {
    const { description, services } = req.body ?? {};

    if (typeof description !== 'string' ||
        description.trim().length < 10 ||
        description.trim().length > 1000) {
        return res.status(422).json({
            success: false,
            error: 'La descripción debe tener entre 10 y 1000 caracteres.'
        });
    }

    if (!Array.isArray(services) ||
        services.length < 1 ||
        services.length > 10 ||
        services.some(service =>
            typeof service !== 'string' ||
            service.trim().length < 2 ||
            service.trim().length > 100
        )) {
        return res.status(422).json({
            success: false,
            error: 'Indica entre 1 y 10 servicios de 2 a 100 caracteres cada uno.'
        });
    }

    const cleanServices = [
        ...new Set(services.map(service => service.trim()))
    ];

    try {
        const profile = await createTechnicianProfile(req.auth.uid, {
            description: description.trim(),
            services: cleanServices
        });

        return res.status(201).json({
            success: true,
            data: profile
        });
    } catch (error) {
        if (error.code === 6 || error.code === 'already-exists') {
            return res.status(409).json({
                success: false,
                error: 'Ya tienes un perfil de técnico registrado.'
            });
        }

        console.error('Error al crear el perfil técnico:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo crear el perfil de técnico.'
        });
    }
}

export async function getMyTechnicianProfile(req, res) {
    try {
        const profile = await getTechnicianProfile(req.auth.uid);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Todavía no tienes un perfil de técnico registrado.'
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Error al consultar el perfil técnico:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo consultar el perfil de técnico.'
        });
    }
}