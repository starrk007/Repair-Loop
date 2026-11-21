import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

function formatearSolicitud(documento) {
    const solicitud = documento.data();

    return {
        id: documento.id,
        usuarioId: solicitud.usuarioId,
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

    return consulta.docs.map(formatearSolicitud);
}
