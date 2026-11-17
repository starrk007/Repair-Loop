import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';

export async function createUserProfile(uid, email, name, role) {
    const userRef = db.collection('users').doc(uid);

    await userRef.create({
        name,
        email,
        role,
        createdAt: FieldValue.serverTimestamp()
    });

    return getUserProfile(uid);
}

export async function getUserProfile(uid) {
    const document = await db.collection('users').doc(uid).get();

    if (!document.exists) {
        return null;
    }

    const user = document.data();

    return {
        uid: document.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt?.toDate().toISOString() ?? null
    };
}