import { getUserProfile } from '../services/user.service.js';

export function requireRole(...allowedRoles) {
    return async function (req, res, next) {
        try {
            const user = await getUserProfile(req.auth.uid);

            if (!user) {
                return res.status(403).json({
                    success: false,
                    error: 'Debes completar tu perfil para continuar.'
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para realizar esta operación.'
                });
            }

            req.user = user;
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