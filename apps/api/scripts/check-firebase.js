import { deleteApp, getApp } from 'firebase-admin/app';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../src/config/firebase.js';

async function checkFirebase() {
    const documentRef = db.collection('connectionChecks').doc('backend');

    try {
        await documentRef.set({
            service: 'repairloop-api',
            status: 'ok',
            checkedAt: FieldValue.serverTimestamp()
        });

        const document = await documentRef.get();

        if (!document.exists || document.data().status !== 'ok') {
            throw new Error('No se pudo verificar el documento guardado.');
        }

        console.log('Conexión con Firestore verificada.');
        console.log(`Documento guardado: ${document.ref.path}`);
    } catch (error) {
        console.error('Error al comprobar Firebase:', error.message);
        process.exitCode = 1;
    } finally {
        await deleteApp(getApp());
    }
}

checkFirebase();