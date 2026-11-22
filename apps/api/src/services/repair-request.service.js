import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DomainError } from '../errors/domain.error.js';

function formatearSolicitud(documento, incluirPropietario = true) {
    const solicitud = documento.data();

    return {
        id: documento.id,
        ...(incluirPropietario ? { usuarioId: solicitud.usuarioId } : {}),
        dispositivoId: solicitud.dispositivoId,
        descripcion: solicitud.descripcion,
        estado: solicitud.estado,
        fechaCreacion: solicitud.fechaCreacion?.toDate().toISOString() ?? null
    };
}

export async function crearSolicitudReparacion(usuarioId, datos) {
    const documentoDispositivo = await db.collection('dispositivos')
        .doc(datos.dispositivoId)
        .get();

    if (!documentoDispositivo.exists ||
        documentoDispositivo.data().propietarioId !== usuarioId) {
        return null;
    }

    const referenciaSolicitud = db.collection('solicitudesReparacion').doc();

    await referenciaSolicitud.create({
        usuarioId,
        dispositivoId: documentoDispositivo.id,
        descripcion: datos.descripcion,
        estado: 'abierta',
        fechaCreacion: FieldValue.serverTimestamp()
    });

    const documento = await referenciaSolicitud.get();

    return formatearSolicitud(documento);
}

export async function obtenerSolicitudesPorUsuario(usuarioId) {
    const consulta = await db.collection('solicitudesReparacion')
        .where('usuarioId', '==', usuarioId)
        .get();

    return consulta.docs.map(formatearSolicitud);
}

export async function obtenerSolicitudesAbiertas() {
    const consulta = await db.collection('solicitudesReparacion')
        .where('estado', '==', 'abierta')
        .get();

    return consulta.docs.map(documento => formatearSolicitud(documento, false));
}

export async function obtenerSolicitudPorId(solicitudId, usuarioId, rol) {
    const documento = await db.collection('solicitudesReparacion').doc(solicitudId).get();

    if (!documento.exists) {
        throw new DomainError(404, 'No se encontró la solicitud.', 'NO_ENCONTRADO');
    }

    const solicitud = documento.data();
    if (rol === 'usuario' && solicitud.usuarioId !== usuarioId) {
        throw new DomainError(403, 'No tienes permisos para consultar esta solicitud.', 'PERMISOS');
    }
    if (rol === 'tecnico' && solicitud.estado !== 'abierta') {
        throw new DomainError(409, 'La solicitud ya no está abierta para cotizar.', 'ESTADO');
    }

    return formatearSolicitud(documento, rol === 'usuario');
}

async function validarSolicitudModificable(transaccion, solicitudId, usuarioId) {
    const referencia = db.collection('solicitudesReparacion').doc(solicitudId);
    const documento = await transaccion.get(referencia);

    if (!documento.exists) {
        throw new DomainError(404, 'No se encontró la solicitud.', 'NO_ENCONTRADO');
    }
    const solicitud = documento.data();
    if (solicitud.usuarioId !== usuarioId) {
        throw new DomainError(403, 'Solo el propietario puede modificar esta solicitud.', 'PERMISOS');
    }
    if (solicitud.estado !== 'abierta') {
        throw new DomainError(409, 'Solo puedes modificar una solicitud abierta.', 'ESTADO');
    }
    if (solicitud.reparacionId) {
        throw new DomainError(409, 'No puedes modificar una solicitud que ya tiene una reparación asociada.', 'ESTADO');
    }

    const cotizaciones = await transaccion.get(db.collection('cotizaciones')
        .where('solicitudId', '==', solicitudId).limit(1));
    if (!cotizaciones.empty) {
        throw new DomainError(409, 'No puedes modificar una solicitud que ya tiene cotizaciones.', 'ESTADO');
    }

    const reparaciones = await transaccion.get(db.collection('reparaciones')
        .where('solicitudId', '==', solicitudId).limit(1));
    if (!reparaciones.empty) {
        throw new DomainError(409, 'No puedes modificar una solicitud que ya tiene una reparación asociada.', 'ESTADO');
    }

    return { referencia, documento };
}

export async function editarDescripcionSolicitud(solicitudId, usuarioId, descripcion) {
    return db.runTransaction(async transaccion => {
        const { referencia, documento } = await validarSolicitudModificable(transaccion, solicitudId, usuarioId);
        transaccion.update(referencia, { descripcion });
        return {
            ...formatearSolicitud(documento),
            descripcion
        };
    });
}

export async function eliminarSolicitud(solicitudId, usuarioId) {
    return db.runTransaction(async transaccion => {
        const { referencia } = await validarSolicitudModificable(transaccion, solicitudId, usuarioId);
        transaccion.delete(referencia);
        return true;
    });
}
