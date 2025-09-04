
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminApp: App;
let db: Firestore;
let storage: Storage;

function initializeAdmin() {
    if (getApps().some(app => app.name === 'admin')) {
        adminApp = getApp('admin');
    } else {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : undefined;

        if (serviceAccount) {
            adminApp = initializeApp({
                credential: cert(serviceAccount),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            }, 'admin');
        } else if (!getApps().length) {
            // This fallback is for environments where service account isn't set,
            // but default credentials might be available (like a local emulator).
            adminApp = initializeApp({
                 storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } else {
            adminApp = getApp();
        }
    }

    db = getFirestore(adminApp);
    storage = getStorage(adminApp);
}

// Initialize on first access
try {
    initializeAdmin();
} catch (error: any) {
    console.error("Firebase Admin SDK initialization error on startup:", error.message);
    // Defer initialization to first use if it fails on startup
    const lazyInit = () => {
        if (!adminApp) {
            try {
                initializeAdmin();
            } catch (initError: any) {
                console.error("Lazy Firebase Admin SDK initialization failed:", initError.message);
                // If it still fails, the subsequent calls will likely fail,
                // but this prevents the app from crashing on start.
            }
        }
    };
    
    // Create lazy getters
    const lazyDb = () => { lazyInit(); return db; };
    const lazyStorage = () => { lazyInit(); return storage; };
    
    db = new Proxy({} as Firestore, { get: (_, prop) => Reflect.get(lazyDb(), prop) });
    storage = new Proxy({} as Storage, { get: (_, prop) => Reflect.get(lazyStorage(), prop) });
}

export { adminApp, db, storage };
