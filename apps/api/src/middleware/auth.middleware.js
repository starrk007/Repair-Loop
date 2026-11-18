import { auth } from '../config/firebase.js';

export async function requireAuth(req, res, next) {
    const authorization = req.get('Authorization') ?? '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({
            success: false,
            error: 'Debes iniciar sesión para realizar esta operación.'
        });
    }

    const token = match[1];

    try {
        req.auth = await auth.verifyIdToken(token, true);
    } catch (error) {
        const invalidTokenCodes = [
            'auth/argument-error',
            'auth/invalid-id-token',
            'auth/id-token-expired',
            'auth/id-token-revoked',
            'auth/user-disabled',
            'auth/user-not-found'
        ];

        if (invalidTokenCodes.includes(error.code)) {
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