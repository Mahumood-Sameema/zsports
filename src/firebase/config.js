// Firebase Client SDK Initializer
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FIREBASE_CONFIG, MOCK_MODE } from '../config/appConfig';

let app;
let auth;
let db;
let storage;

if (!MOCK_MODE) {
  try {
    app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error('Firebase initialization failed. Falling back to Mock Database Mode.', err);
  }
}

export { auth, db, storage };
export default app;