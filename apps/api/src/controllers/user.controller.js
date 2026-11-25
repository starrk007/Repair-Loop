import {
    crearPerfilUsuario,
    obtenerPerfilUsuario
} from '../services/user.service.js';

export async function crearPerfil(req, res) {
    const { nombre, rol } = req.body ?? {};

    if (typeof nombre !== 'string' ||
        nombre.trim().length < 2 ||
        nombre.trim().length > 100) {
        return res.status(422).json({
            success: false,
            error: 'El nombre debe tener entre 2 y 100 caracteres.'
        });
    }

    if (!['usuario', 'tecnico'].includes(rol)) {
        return res.status(422).json({
            success: false,
            error: 'El rol debe ser usuario o tecnico.'
        });
    }

    try {
        const usuario = await crearPerfilUsuario(
            req.auth.uid,
            req.auth.email ?? null,
            nombre.trim(),
            rol
        );

        return res.status(201).json({
            success: true,
            data: usuario
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

export async function obtenerPerfil(req, res) {
    try {
        const usuario = await obtenerPerfilUsuario(req.auth.uid);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                error: 'Todavía no tienes un perfil registrado.'
            });
        }

        return res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Error al consultar el perfil:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo consultar el perfil.'
        });
    }
}
