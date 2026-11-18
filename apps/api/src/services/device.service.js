import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

function formatDevice(document) {
    const device = document.data();

    return {
        id: document.id,
        ownerId: device.ownerId,
        type: device.type,
        brand: device.brand,
        model: device.model,
        createdAt: device.createdAt?.toDate().toISOString() ?? null
    };
}

export async function createDevice(ownerId, data) {
    const deviceRef = db.collection('devices').doc();

    await deviceRef.create({
        ownerId,
        type: data.type,
        brand: data.brand,
        model: data.model,
        createdAt: FieldValue.serverTimestamp()
    });

    const document = await deviceRef.get();

    return formatDevice(document);
}

export async function getDevicesByOwner(ownerId) {
    const snapshot = await db.collection('devices')
        .where('ownerId', '==', ownerId)
        .get();

    return snapshot.docs.map(formatDevice);
}