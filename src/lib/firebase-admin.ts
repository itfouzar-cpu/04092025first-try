
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminApp: App;
let db: Firestore;
let storage: Storage;

function initializeAdmin() {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccount = serviceAccountKey ? JSON.parse(serviceAccountKey) : undefined;
    
    if (!getApps().some(app => app.name === 'admin')) {
        adminApp = initializeApp({
            credential: cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        }, 'admin');
    } else {
        adminApp = getApp('admin');
    }

    db = getFirestore(adminApp);
    storage = getStorage(adminApp);
}

// Initialize on first access in a try-catch block to prevent build errors
try {
    initializeAdmin();
} catch (error) {
    // This will likely fail in the build environment, which is okay.
    // The services will be initialized on first actual use in a server function.
    console.log("Firebase Admin SDK failed to initialize on build, will lazy load.");
}

export { adminApp, db, storage };
