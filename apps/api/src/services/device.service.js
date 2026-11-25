import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

function formatearDispositivo(documento) {
    const dispositivo = documento.data();

    return {
        id: documento.id,
        propietarioId: dispositivo.propietarioId,
        tipo: dispositivo.tipo,
        marca: dispositivo.marca,
        modelo: dispositivo.modelo,
        precioReemplazo: dispositivo.precioReemplazo ?? null,
        fechaCreacion: dispositivo.fechaCreacion?.toDate().toISOString() ?? null
    };
}

export async function crearDispositivo(propietarioId, datos) {
    const referenciaDispositivo = db.collection('dispositivos').doc();

    await referenciaDispositivo.create({
        propietarioId,
        tipo: datos.tipo,
        marca: datos.marca,
        modelo: datos.modelo,
        ...(datos.precioReemplazo !== undefined ? { precioReemplazo: datos.precioReemplazo } : {}),
        fechaCreacion: FieldValue.serverTimestamp()
    });

    const documento = await referenciaDispositivo.get();

    return formatearDispositivo(documento);
}

export async function establecerPrecioReemplazo(dispositivoId, propietarioId, precioReemplazo) {
    return db.runTransaction(async transaccion => {
        const referencia = db.collection('dispositivos').doc(dispositivoId);
        const documento = await transaccion.get(referencia);
        if (!documento.exists) {
            return null;
        }
        if (documento.data().propietarioId !== propietarioId) {
            return false;
        }
        transaccion.update(referencia, { precioReemplazo });
        return {
            ...formatearDispositivo(documento),
            precioReemplazo
        };
    });
}

export async function obtenerDispositivosPorPropietario(propietarioId) {
    const consulta = await db.collection('dispositivos')
        .where('propietarioId', '==', propietarioId)
        .get();

    return consulta.docs.map(formatearDispositivo);
}
