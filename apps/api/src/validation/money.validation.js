import { DomainError } from '../errors/domain.error.js';

const MAX_PRECIO_CENTAVOS = 100_000_000_00;

export function convertirACentavos(valor, etiqueta = 'El importe') {
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0 ||
        valor > MAX_PRECIO_CENTAVOS / 100) {
        throw new DomainError(422, `${etiqueta} debe ser un número positivo válido.`, 'VALIDACION');
    }

    const centavos = Math.round((valor + Number.EPSILON) * 100);
    if (!Number.isSafeInteger(centavos) || centavos < 1 || centavos > MAX_PRECIO_CENTAVOS) {
        throw new DomainError(422, `${etiqueta} excede el límite permitido.`, 'VALIDACION');
    }
    return centavos;
}

export function validarPrecioReemplazo(valor) {
    return convertirACentavos(valor, 'El precio de reemplazo') / 100;
}
