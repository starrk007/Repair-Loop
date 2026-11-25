import { DomainError } from '../errors/domain.error.js';

const MAX_CONCEPTOS = 20;
const MAX_PRECIO_CENTAVOS = 100_000_000_00;

export function validarDatosCotizacion(datos) {
    if (!datos || !Array.isArray(datos.conceptos) ||
        datos.conceptos.length < 1 || datos.conceptos.length > MAX_CONCEPTOS) {
        throw new DomainError(422, 'Debes indicar entre 1 y 20 conceptos válidos.', 'VALIDACION');
    }

    if (!Number.isInteger(datos.diasEstimados) || datos.diasEstimados < 1 || datos.diasEstimados > 3650) {
        throw new DomainError(422, 'Los días estimados deben ser un entero positivo de hasta 3650.', 'VALIDACION');
    }

    let totalCentavos = 0;
    const conceptos = datos.conceptos.map((concepto, indice) => {
        if (!concepto || typeof concepto.descripcion !== 'string' ||
            concepto.descripcion.trim().length < 2 || concepto.descripcion.trim().length > 500) {
            throw new DomainError(422, `La descripción del concepto ${indice + 1} debe tener entre 2 y 500 caracteres.`, 'VALIDACION');
        }
        if (!Number.isInteger(concepto.cantidad) || concepto.cantidad < 1 || concepto.cantidad > 10000) {
            throw new DomainError(422, `La cantidad del concepto ${indice + 1} debe ser un entero positivo.`, 'VALIDACION');
        }
        if (typeof concepto.precioUnitario !== 'number' ||
            !Number.isFinite(concepto.precioUnitario) || concepto.precioUnitario < 0 ||
            concepto.precioUnitario > MAX_PRECIO_CENTAVOS / 100) {
            throw new DomainError(422, `El precio unitario del concepto ${indice + 1} no es válido.`, 'VALIDACION');
        }

        const precioCentavos = Math.round((concepto.precioUnitario + Number.EPSILON) * 100);
        const subtotal = precioCentavos * concepto.cantidad;
        if (!Number.isSafeInteger(subtotal) || subtotal > MAX_PRECIO_CENTAVOS ||
            totalCentavos > MAX_PRECIO_CENTAVOS - subtotal) {
            throw new DomainError(422, 'El importe total de la cotización excede el límite permitido.', 'VALIDACION');
        }
        totalCentavos += subtotal;

        return {
            descripcion: concepto.descripcion.trim(),
            cantidad: concepto.cantidad,
            precioUnitario: precioCentavos / 100
        };
    });

    return {
        conceptos,
        total: totalCentavos / 100,
        diasEstimados: datos.diasEstimados
    };
}
