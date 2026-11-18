import {
    createUserProfile,
    getUserProfile
} from '../services/user.service.js';

export async function createProfile(req, res) {
    const { name, role } = req.body ?? {};

    if (typeof name !== 'string' ||
        name.trim().length < 2 ||
        name.trim().length > 100) {
        return res.status(422).json({
            success: false,
            error: 'El nombre debe tener entre 2 y 100 caracteres.'
        });
    }

    if (!['client', 'technician'].includes(role)) {
        return res.status(422).json({
            success: false,
            error: 'El rol debe ser client o technician.'
        });
    }

    try {
        const user = await createUserProfile(
            req.auth.uid,
            req.auth.email ?? null,
            name.trim(),
            role
        );

        return res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        if (error.code === 6 || error.code === 'already-exists') {
            return res.status(409).json({
                success: false,
                error: 'Ya tienes un perfil registrado.'
            });
        }

        console.error('Error al crear el perfil:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo crear el perfil.'
        });
    }
}

export async function getProfile(req, res) {
    try {
        const user = await getUserProfile(req.auth.uid);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Todavía no tienes un perfil registrado.'
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al consultar el perfil:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo consultar el perfil.'
        });
    }
}