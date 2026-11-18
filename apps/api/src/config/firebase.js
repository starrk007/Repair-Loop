import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const credentialsPath = new URL(
    '../../credentials/firebase-admin.json',
    import.meta.url
);

const serviceAccount = JSON.parse(
    readFileSync(credentialsPath, 'utf8')
);

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);