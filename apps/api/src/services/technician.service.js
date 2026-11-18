import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

export async function createTechnicianProfile(uid, data) {
    const profileRef = db.collection('technicianProfiles').doc(uid);

    await profileRef.create({
        description: data.description,
        services: data.services,
        createdAt: FieldValue.serverTimestamp()
    });

    return getTechnicianProfile(uid);
}

export async function getTechnicianProfile(uid) {
    const document = await db.collection('technicianProfiles').doc(uid).get();

    if (!document.exists) {
        return null;
    }

    const profile = document.data();

    return {
        uid: document.id,
        description: profile.description,
        services: profile.services,
        createdAt: profile.createdAt?.toDate().toISOString() ?? null
    };
}