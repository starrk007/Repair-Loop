import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

function formatRepairRequest(document) {
    const repairRequest = document.data();

    return {
        id: document.id,
        clientId: repairRequest.clientId,
        deviceId: repairRequest.deviceId,
        description: repairRequest.description,
        status: repairRequest.status,
        createdAt: repairRequest.createdAt?.toDate().toISOString() ?? null
    };
}

export async function createRepairRequest(clientId, data) {
    const deviceDocument = await db.collection('devices')
        .doc(data.deviceId)
        .get();

    if (!deviceDocument.exists ||
        deviceDocument.data().ownerId !== clientId) {
        return null;
    }

    const requestRef = db.collection('repairRequests').doc();

    await requestRef.create({
        clientId,
        deviceId: deviceDocument.id,
        description: data.description,
        status: 'open',
        createdAt: FieldValue.serverTimestamp()
    });

    const document = await requestRef.get();

    return formatRepairRequest(document);
}

export async function getRepairRequestsByClient(clientId) {
    const snapshot = await db.collection('repairRequests')
        .where('clientId', '==', clientId)
        .get();

    return snapshot.docs.map(formatRepairRequest);
}

export async function getOpenRepairRequests() {
    const snapshot = await db.collection('repairRequests')
        .where('status', '==', 'open')
        .get();

    return snapshot.docs.map(document => {
        const repairRequest = document.data();

        return {
            id: document.id,
            description: repairRequest.description,
            status: repairRequest.status,
            createdAt: repairRequest.createdAt?.toDate().toISOString() ?? null
        };
    });
}