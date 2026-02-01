
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// HINWEIS: Diese Konfigurationsdaten müssen mit deinen echten Firebase-Projektdaten gefüllt werden.
const firebaseConfig = {
  apiKey: "AIzaSyBCalSgMxY0bU5Whibm4LDAlSUkCc_Hayg",
  authDomain: "horizontos.firebaseapp.com",
  projectId: "horizontos",
  storageBucket: "horizontos.firebasestorage.app",
  messagingSenderId: "1034235194919",
  appId: "1:1034235194919:web:8d3a13d689f299d33d2802"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west3'); // Region anpassen falls nötig
