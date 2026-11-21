import { auth } from '../config/firebase.js';

export async function requerirAutenticacion(req, res, next) {
    const autorizacion = req.get('Authorization') ?? '';
    const coincidencia = autorizacion.match(/^Bearer\s+(\S+)$/i);

    if (!coincidencia) {
        return res.status(401).json({
            success: false,
            error: 'Debes iniciar sesión para realizar esta operación.'
        });
    }

    const token = coincidencia[1];

    try {
        req.auth = await auth.verifyIdToken(token, true);
    } catch (error) {
        const codigosTokenInvalido = [
            'auth/argument-error',
            'auth/invalid-id-token',
            'auth/id-token-expired',
            'auth/id-token-revoked',
            'auth/user-disabled',
            'auth/user-not-found'
        ];

        if (codigosTokenInvalido.includes(error.code)) {
            return res.status(401).json({
                success: false,
                error: 'La sesión no es válida. Inicia sesión nuevamente.'
            });
        }

        console.error('Error al verificar la sesión:', error.code);

        return res.status(500).json({
            success: false,
            error: 'No se pudo verificar la sesión.'
        });
    }

    next();
}
