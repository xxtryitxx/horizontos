
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase Konfiguration mit Environment Variablen
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCalSgMxY0bU5Whibm4LDAlSUkCc_Hayg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "horizontos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "horizontos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "horizontos.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1034235194919",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1034235194919:web:8d3a13d689f299d33d2802"
};

// Firebase App initialisieren
const app = initializeApp(firebaseConfig);

// Services exportieren
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west3');

// Offline-Unterstützung aktivieren
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Mehrere Tabs geöffnet - Offline-Persistierung nicht verfügbar');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser unterstützt Offline-Persistierung nicht');
  }
});

export default app;
