import { crearPerfilTecnico, obtenerPerfilTecnico } from '../services/technician.service.js';

export async function registrarPerfilTecnico(req, res) {
    const { descripcion, servicios } = req.body ?? {};

    if (typeof descripcion !== 'string' ||
        descripcion.trim().length < 10 ||
        descripcion.trim().length > 1000) {
        return res.status(422).json({
            success: false,
            error: 'La descripción debe tener entre 10 y 1000 caracteres.'
        });
    }

    if (!Array.isArray(servicios) ||
        servicios.length < 1 ||
        servicios.length > 10 ||
        servicios.some(servicio =>
            typeof servicio !== 'string' ||
            servicio.trim().length < 2 ||
            servicio.trim().length > 100
        )) {
        return res.status(422).json({
            success: false,
            error: 'Indica entre 1 y 10 servicios de 2 a 100 caracteres cada uno.'
        });
    }

    const serviciosLimpios = [
        ...new Set(servicios.map(servicio => servicio.trim()))
    ];

    try {
        const perfil = await crearPerfilTecnico(req.auth.uid, {
            descripcion: descripcion.trim(),
            servicios: serviciosLimpios
        });

        return res.status(201).json({
            success: true,
            data: perfil
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
            error: 'No se pudo crear el perfil técnico.'
        });
    }
}

export async function obtenerMiPerfilTecnico(req, res) {
    try {
        const perfil = await obtenerPerfilTecnico(req.auth.uid);

        if (!perfil) {
            return res.status(404).json({
                success: false,
                error: 'Todavía no tienes un perfil de técnico registrado.'
            });
        }

        return res.status(200).json({
            success: true,
            data: perfil
        });
    } catch (error) {
        console.error('Error al consultar el perfil técnico:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo consultar el perfil técnico.'
        });
    }
}
