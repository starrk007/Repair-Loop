import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DomainError } from '../errors/domain.error.js';
import { siguienteEstadoReparacion } from '../validation/repair.validation.js';
import { calcularAhorro } from '../validation/savings.validation.js';

function fechaISO(valor) {
    return valor?.toDate?.().toISOString() ?? null;
}

function formatearHistorial(historial = []) {
    return historial.map(evento => ({
        estado: evento.estado,
        responsableId: evento.responsableId,
        observacion: evento.observacion,
        fecha: fechaISO(evento.fecha)
    }));
}

function formatearReparacion(documento) {
    const reparacion = documento.data();
    return {
        id: documento.id,
        solicitudId: reparacion.solicitudId,
        cotizacionId: reparacion.cotizacionId,
        usuarioId: reparacion.usuarioId,
        tecnicoId: reparacion.tecnicoId,
        nombreUsuario: reparacion.nombreUsuario ?? null,
        nombreTecnico: reparacion.nombreTecnico ?? null,
        dispositivo: reparacion.dispositivo,
        cotizacionAceptada: reparacion.cotizacionAceptada,
        estado: reparacion.estado,
        fechaAsignacion: fechaISO(reparacion.fechaAsignacion),
        historial: formatearHistorial(reparacion.historial),
        fechaActualizacion: fechaISO(reparacion.fechaActualizacion)
    };
}

async function leerReparacionAutorizada(reparacionId, usuarioId, rol, transaccion = null) {
    const referencia = db.collection('reparaciones').doc(reparacionId);
    const documento = transaccion ? await transaccion.get(referencia) : await referencia.get();
    if (!documento.exists) {
        throw new DomainError(404, 'No se encontró la reparación.', 'NO_ENCONTRADO');
    }
    const reparacion = documento.data();
    if ((rol === 'usuario' && reparacion.usuarioId !== usuarioId) ||
        (rol === 'tecnico' && reparacion.tecnicoId !== usuarioId)) {
        throw new DomainError(403, 'No tienes permisos para consultar esta reparación.', 'PERMISOS');
    }
    return { referencia, documento };
}

export async function aceptarCotizacion(cotizacionId, usuarioId) {
    const reparacionId = await db.runTransaction(async transaccion => {
        const cotizacionRef = db.collection('cotizaciones').doc(cotizacionId);
        const cotizacionDoc = await transaccion.get(cotizacionRef);
        if (!cotizacionDoc.exists) {
            throw new DomainError(404, 'No se encontró la cotización.', 'NO_ENCONTRADO');
        }

        const cotizacion = cotizacionDoc.data();
        const solicitudRef = db.collection('solicitudesReparacion').doc(cotizacion.solicitudId);
        const solicitudDoc = await transaccion.get(solicitudRef);
        if (!solicitudDoc.exists) {
            throw new DomainError(404, 'No se encontró la solicitud asociada.', 'NO_ENCONTRADO');
        }

        const solicitud = solicitudDoc.data();
        const reparaciones = await transaccion.get(db.collection('reparaciones')
            .where('solicitudId', '==', cotizacion.solicitudId).limit(1));

        if (solicitud.usuarioId !== usuarioId) {
            throw new DomainError(403, 'Solo el propietario puede aceptar cotizaciones.', 'PERMISOS');
        }
        if (solicitud.estado !== 'abierta') {
            if (cotizacion.estado === 'aceptada' && !reparaciones.empty &&
                reparaciones.docs[0].data().cotizacionId === cotizacionId) {
                return reparaciones.docs[0].id;
            }
            throw new DomainError(409, 'La solicitud ya fue asignada y no admite decisiones.', 'ESTADO');
        }
        if (cotizacion.estado !== 'pendiente') {
            throw new DomainError(409, 'Solo puedes aceptar una cotización pendiente.', 'ESTADO');
        }
        if (!reparaciones.empty) {
            throw new DomainError(409, 'La solicitud ya tiene una reparación asignada.', 'ESTADO');
        }

        const dispositivoRef = db.collection('dispositivos').doc(solicitud.dispositivoId);
        const usuarioRef = db.collection('usuarios').doc(usuarioId);
        const tecnicoRef = db.collection('usuarios').doc(cotizacion.tecnicoId);
        const [dispositivoDoc, usuarioDoc, tecnicoDoc] = await Promise.all([
            transaccion.get(dispositivoRef),
            transaccion.get(usuarioRef),
            transaccion.get(tecnicoRef)
        ]);
        if (!dispositivoDoc.exists || dispositivoDoc.data().propietarioId !== usuarioId) {
            throw new DomainError(409, 'El dispositivo asociado ya no está disponible.', 'ESTADO');
        }
        const todasCotizaciones = await transaccion.get(db.collection('cotizaciones')
            .where('solicitudId', '==', cotizacion.solicitudId));

        const ahora = Timestamp.now();
        const nuevaReparacionRef = db.collection('reparaciones').doc();
        const dispositivo = dispositivoDoc.data();
        const reparacion = {
            solicitudId: cotizacion.solicitudId,
            cotizacionId,
            usuarioId,
            tecnicoId: cotizacion.tecnicoId,
            nombreUsuario: usuarioDoc.data()?.nombre ?? null,
            nombreTecnico: tecnicoDoc.data()?.nombre ?? null,
            dispositivo: {
                id: dispositivoDoc.id,
                tipo: dispositivo.tipo,
                marca: dispositivo.marca,
                modelo: dispositivo.modelo,
                precioReemplazo: dispositivo.precioReemplazo ?? null
            },
            cotizacionAceptada: {
                conceptos: cotizacion.conceptos,
                total: cotizacion.total,
                diasEstimados: cotizacion.diasEstimados
            },
            estado: 'asignada',
            fechaAsignacion: ahora,
            historial: [{
                estado: 'asignada',
                responsableId: usuarioId,
                observacion: 'Cotización aceptada.',
                fecha: ahora
            }],
            fechaActualizacion: ahora
        };

        transaccion.create(nuevaReparacionRef, reparacion);
        transaccion.update(cotizacionRef, {
            estado: 'aceptada',
            reparacionId: nuevaReparacionRef.id,
            fechaDecision: ahora
        });
        for (const documento of todasCotizaciones.docs) {
            if (documento.id !== cotizacionId && documento.data().estado === 'pendiente') {
                transaccion.update(documento.ref, {
                    estado: 'no_disponible',
                    fechaDecision: ahora
                });
            }
        }
        transaccion.update(solicitudRef, {
            estado: 'asignada',
            tecnicoId: cotizacion.tecnicoId,
            cotizacionId,
            reparacionId: nuevaReparacionRef.id
        });
        return nuevaReparacionRef.id;
    });

    const documento = await db.collection('reparaciones').doc(reparacionId).get();
    return formatearReparacion(documento);
}

export async function rechazarCotizacion(cotizacionId, usuarioId) {
    await db.runTransaction(async transaccion => {
        const cotizacionRef = db.collection('cotizaciones').doc(cotizacionId);
        const cotizacionDoc = await transaccion.get(cotizacionRef);
        if (!cotizacionDoc.exists) {
            throw new DomainError(404, 'No se encontró la cotización.', 'NO_ENCONTRADO');
        }
        const cotizacion = cotizacionDoc.data();
        const solicitudRef = db.collection('solicitudesReparacion').doc(cotizacion.solicitudId);
        const solicitudDoc = await transaccion.get(solicitudRef);
        if (!solicitudDoc.exists) {
            throw new DomainError(404, 'No se encontró la solicitud asociada.', 'NO_ENCONTRADO');
        }
        const solicitud = solicitudDoc.data();
        if (solicitud.usuarioId !== usuarioId) {
            throw new DomainError(403, 'Solo el propietario puede rechazar cotizaciones.', 'PERMISOS');
        }
        if (solicitud.estado !== 'abierta' || cotizacion.estado !== 'pendiente') {
            throw new DomainError(409, 'Solo puedes rechazar cotizaciones pendientes de solicitudes abiertas.', 'ESTADO');
        }
        transaccion.update(cotizacionRef, {
            estado: 'rechazada',
            fechaDecision: Timestamp.now()
        });
    });
    return true;
}

export async function obtenerReparaciones(usuarioId, rol) {
    const campo = rol === 'usuario' ? 'usuarioId' : 'tecnicoId';
    const consulta = await db.collection('reparaciones').where(campo, '==', usuarioId).get();
    return consulta.docs.map(formatearReparacion);
}

export async function obtenerReparacion(reparacionId, usuarioId, rol) {
    const { documento } = await leerReparacionAutorizada(reparacionId, usuarioId, rol);
    return formatearReparacion(documento);
}

export async function avanzarReparacion(reparacionId, tecnicoId, estado, observacion) {
    const resultado = await db.runTransaction(async transaccion => {
        const { referencia, documento } = await leerReparacionAutorizada(
            reparacionId, tecnicoId, 'tecnico', transaccion
        );
        const reparacion = documento.data();
        const solicitudRef = db.collection('solicitudesReparacion').doc(reparacion.solicitudId);
        const solicitudDoc = await transaccion.get(solicitudRef);
        if (!solicitudDoc.exists || solicitudDoc.data().reparacionId !== reparacionId) {
            throw new DomainError(409, 'La solicitud asociada no es coherente con la reparación.', 'ESTADO');
        }
        siguienteEstadoReparacion(reparacion.estado, estado);
        const evento = {
            estado,
            responsableId: tecnicoId,
            observacion,
            fecha: Timestamp.now()
        };
        transaccion.update(referencia, {
            estado,
            historial: FieldValue.arrayUnion(evento),
            fechaActualizacion: evento.fecha
        });
        transaccion.update(solicitudRef, { estado });
        return {
            ...formatearReparacion(documento),
            estado,
            historial: [...formatearHistorial(reparacion.historial), {
                estado,
                responsableId: tecnicoId,
                observacion,
                fecha: evento.fecha.toDate().toISOString()
            }],
            fechaActualizacion: evento.fecha.toDate().toISOString()
        };
    });
    return resultado;
}

export async function obtenerAhorro(reparacionId, usuarioId, rol) {
    const { documento } = await leerReparacionAutorizada(reparacionId, usuarioId, rol);
    const reparacion = documento.data();
    const dispositivo = await db.collection('dispositivos').doc(reparacion.dispositivo.id).get();
    const precioReemplazo = dispositivo.exists
        ? dispositivo.data().precioReemplazo
        : reparacion.dispositivo.precioReemplazo;
    return calcularAhorro(precioReemplazo, reparacion.cotizacionAceptada.total);
}
