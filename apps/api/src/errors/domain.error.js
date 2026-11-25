export class DomainError extends Error {
    constructor(status, message, code) {
        super(message);
        this.name = 'DomainError';
        this.status = status;
        this.code = code;
    }
}

export function responderError(res, error, mensajeInterno) {
    if (error instanceof DomainError) {
        return res.status(error.status).json({
            success: false,
            error: error.message
        });
    }

    console.error(mensajeInterno, error.code);
    return res.status(500).json({
        success: false,
        error: 'Ocurrió un error interno al procesar la operación.'
    });
}
