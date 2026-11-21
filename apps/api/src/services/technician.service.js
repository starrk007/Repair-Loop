import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

export async function crearPerfilTecnico(uid, datos) {
    const referenciaPerfil = db.collection('perfilesTecnicos').doc(uid);

    await referenciaPerfil.create({
        descripcion: datos.descripcion,
        servicios: datos.servicios,
        fechaCreacion: FieldValue.serverTimestamp()
    });

    return obtenerPerfilTecnico(uid);
}

export async function obtenerPerfilTecnico(uid) {
    const documento = await db.collection('perfilesTecnicos').doc(uid).get();

    if (!documento.exists) {
        return null;
    }

    const perfil = documento.data();

    return {
        uid: documento.id,
        descripcion: perfil.descripcion,
        servicios: perfil.servicios,
        fechaCreacion: perfil.fechaCreacion?.toDate().toISOString() ?? null
    };
}
