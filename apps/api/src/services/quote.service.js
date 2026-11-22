import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DomainError } from '../errors/domain.error.js';

function fechaISO(valor) {
    return valor?.toDate?.().toISOString() ?? null;
}

function formatearCotizacion(documento, nombreTecnico) {
    const cotizacion = documento.data();
    return {
        id: documento.id,
        solicitudId: cotizacion.solicitudId,
        tecnicoId: cotizacion.tecnicoId,
        usuarioId: cotizacion.usuarioId,
        nombreTecnico,
        conceptos: cotizacion.conceptos,
        total: cotizacion.total,
        diasEstimados: cotizacion.diasEstimados,
        estado: cotizacion.estado,
        fechaCreacion: fechaISO(cotizacion.fechaCreacion)
    };
}

async function nombrePublicoTecnico(tecnicoId) {
    const usuario = await db.collection('usuarios').doc(tecnicoId).get();
    return usuario.exists ? (usuario.data().nombre ?? null) : null;
}

export async function crearCotizacion(tecnicoId, solicitudId, datos) {
    const cotizacionCreada = await db.runTransaction(async transaccion => {
        const solicitudRef = db.collection('solicitudesReparacion').doc(solicitudId);
        const usuarioRef = db.collection('usuarios').doc(tecnicoId);
        const perfilRef = db.collection('perfilesTecnicos').doc(tecnicoId);
        const [solicitudDoc, usuarioDoc, perfilDoc] = await Promise.all([
            transaccion.get(solicitudRef),
            transaccion.get(usuarioRef),
            transaccion.get(perfilRef)
        ]);

        const perfil = perfilDoc.data();
        if (!usuarioDoc.exists || usuarioDoc.data().rol !== 'tecnico' || !perfilDoc.exists ||
            typeof perfil.descripcion !== 'string' || !Array.isArray(perfil.servicios) ||
            perfil.descripcion.trim().length < 1 || perfil.servicios.length < 1) {
            throw new DomainError(403, 'Debes completar tu perfil técnico para cotizar.', 'PERMISOS');
        }
        if (!solicitudDoc.exists) {
            throw new DomainError(404, 'No se encontró la solicitud.', 'NO_ENCONTRADO');
        }

        const solicitud = solicitudDoc.data();
        if (solicitud.usuarioId === tecnicoId) {
            throw new DomainError(403, 'No puedes cotizar tu propia solicitud.', 'PERMISOS');
        }
        if (solicitud.estado !== 'abierta') {
            throw new DomainError(409, 'Solo se pueden cotizar solicitudes abiertas.', 'ESTADO');
        }

        const existentes = await transaccion.get(db.collection('cotizaciones')
            .where('solicitudId', '==', solicitudId));
        if (existentes.docs.some(documento => documento.data().tecnicoId === tecnicoId)) {
            throw new DomainError(409, 'Ya tienes una cotización para esta solicitud.', 'DUPLICADO');
        }

        const referencia = db.collection('cotizaciones').doc();
        transaccion.create(referencia, {
            solicitudId,
            tecnicoId,
            usuarioId: solicitud.usuarioId,
            conceptos: datos.conceptos,
            total: datos.total,
            diasEstimados: datos.diasEstimados,
            estado: 'pendiente',
            fechaCreacion: FieldValue.serverTimestamp()
        });

        return referencia.id;
    });

    const documento = await db.collection('cotizaciones').doc(cotizacionCreada).get();
    return formatearCotizacion(documento, await nombrePublicoTecnico(tecnicoId));
}

async function obtenerCotizacionDocumento(cotizacionId) {
    const documento = await db.collection('cotizaciones').doc(cotizacionId).get();
    if (!documento.exists) {
        throw new DomainError(404, 'No se encontró la cotización.', 'NO_ENCONTRADO');
    }
    return documento;
}

function verificarAcceso(cotizacion, usuarioId, rol) {
    if (rol === 'usuario' && cotizacion.usuarioId !== usuarioId) {
        throw new DomainError(403, 'No tienes permisos para consultar esta cotización.', 'PERMISOS');
    }
    if (rol === 'tecnico' && cotizacion.tecnicoId !== usuarioId) {
        throw new DomainError(403, 'No tienes permisos para consultar esta cotización.', 'PERMISOS');
    }
}

export async function obtenerCotizacion(cotizacionId, usuarioId, rol) {
    const documento = await obtenerCotizacionDocumento(cotizacionId);
    verificarAcceso(documento.data(), usuarioId, rol);
    return formatearCotizacion(documento, await nombrePublicoTecnico(documento.data().tecnicoId));
}

export async function obtenerCotizacionesPorSolicitud(solicitudId, usuarioId) {
    const solicitud = await db.collection('solicitudesReparacion').doc(solicitudId).get();
    if (!solicitud.exists) {
        throw new DomainError(404, 'No se encontró la solicitud.', 'NO_ENCONTRADO');
    }
    if (solicitud.data().usuarioId !== usuarioId) {
        throw new DomainError(403, 'Solo el propietario puede consultar estas cotizaciones.', 'PERMISOS');
    }
    const consulta = await db.collection('cotizaciones').where('solicitudId', '==', solicitudId).get();
    return Promise.all(consulta.docs.map(async documento =>
        formatearCotizacion(documento, await nombrePublicoTecnico(documento.data().tecnicoId))));
}

export async function obtenerCotizacionesPorTecnico(tecnicoId) {
    const consulta = await db.collection('cotizaciones').where('tecnicoId', '==', tecnicoId).get();
    return Promise.all(consulta.docs.map(async documento =>
        formatearCotizacion(documento, await nombrePublicoTecnico(tecnicoId))));
}
