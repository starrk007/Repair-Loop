import { DomainError } from '../errors/domain.error.js';

const TRANSICIONES = Object.freeze({
    asignada: 'en_reparacion',
    en_reparacion: 'finalizada'
});

export function validarAvanceReparacion(estado, observacion) {
    if (!Object.prototype.hasOwnProperty.call(TRANSICIONES, estado)) {
        throw new DomainError(422, 'El estado solicitado no es válido.', 'VALIDACION');
    }
    if (typeof observacion !== 'string' || observacion.trim().length < 2 || observacion.trim().length > 500) {
        throw new DomainError(422, 'La observación debe tener entre 2 y 500 caracteres.', 'VALIDACION');
    }
    return { estado, observacion: observacion.trim() };
}

export function siguienteEstadoReparacion(estadoActual, estadoSolicitado) {
    if (TRANSICIONES[estadoActual] !== estadoSolicitado) {
        throw new DomainError(409, 'La reparación solo puede avanzar al siguiente estado permitido.', 'ESTADO');
    }
    return estadoSolicitado;
}
