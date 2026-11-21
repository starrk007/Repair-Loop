import { obtenerPerfilUsuario } from '../services/user.service.js';

export function requerirRol(...rolesPermitidos) {
    return async function (req, res, next) {
        try {
            const usuario = await obtenerPerfilUsuario(req.auth.uid);

            if (!usuario) {
                return res.status(403).json({
                    success: false,
                    error: 'Debes completar tu perfil para continuar.'
                });
            }

            if (!rolesPermitidos.includes(usuario.rol)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para realizar esta operación.'
                });
            }

            req.user = usuario;
        } catch (error) {
            console.error('Error al consultar los permisos:', error.code);

            return res.status(500).json({
                success: false,
                error: 'No se pudieron verificar los permisos.'
            });
        }

        next();
    };
}
