import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

export async function crearPerfilUsuario(uid, correo, nombre, rol) {
    const referenciaUsuario = db.collection('usuarios').doc(uid);

    await referenciaUsuario.create({
        nombre,
        correo,
        rol,
        fechaCreacion: FieldValue.serverTimestamp()
    });

    return obtenerPerfilUsuario(uid);
}

export async function obtenerPerfilUsuario(uid) {
    const documento = await db.collection('usuarios').doc(uid).get();

    if (!documento.exists) {
        return null;
    }

    const usuario = documento.data();

    return {
        uid: documento.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        fechaCreacion: usuario.fechaCreacion?.toDate().toISOString() ?? null
    };
}
