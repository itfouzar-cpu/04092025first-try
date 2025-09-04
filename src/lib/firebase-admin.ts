
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminApp: App;
let db: Firestore;
let storage: Storage;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  adminApp = !getApps().length
    ? initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    : getApp();

  db = getFirestore(adminApp);
  storage = getStorage(adminApp);

} catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // In a non-production environment, it's okay to have a fallback.
    // In production, you'd want this to be a hard error.
    if (!getApps().length) {
        adminApp = initializeApp(); // Initialize with default credentials if available
    } else {
        adminApp = getApp();
    }
    db = getFirestore(adminApp);
    storage = getStorage(adminApp);
}


export { adminApp, db, storage };
