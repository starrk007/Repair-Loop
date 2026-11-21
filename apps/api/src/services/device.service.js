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
        fechaCreacion: FieldValue.serverTimestamp()
    });

    const documento = await referenciaDispositivo.get();

    return formatearDispositivo(documento);
}

export async function obtenerDispositivosPorPropietario(propietarioId) {
    const consulta = await db.collection('dispositivos')
        .where('propietarioId', '==', propietarioId)
        .get();

    return consulta.docs.map(formatearDispositivo);
}
