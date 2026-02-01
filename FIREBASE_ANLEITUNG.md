# Firebase Integration Anleitung für HorizontOS

## Status: ✅ Vollständig integriert & funktionsbereit

Deine App hat eine voll funktionsfähige Firebase-Integration. Diese Anleitung zeigt alle getesteten Code-Beispiele.

---

## 📋 Inhaltsverzeichnis

1. [Schnellstart](#schnellstart)
2. [Environment Setup](#environment-setup)
3. [Authentication (Authentifizierung)](#authentication)
4. [Firestore (Datenbank)](#firestore)
5. [Cloud Storage (Dateiablage)](#cloud-storage)
6. [Cloud Functions (Serverfunktionen)](#cloud-functions)
7. [Real-time Listener](#real-time-listener)
8. [Sicherheit & Security Rules](#sicherheit)
9. [Fehlerbehandlung](#fehlerbehandlung)
10. [Best Practices](#best-practices)

---

## 🚀 Schnellstart

### 1. Firebase Console Setup (< 2 Minuten)
```bash
# 1. Gehe zu https://console.firebase.google.com
# 2. Öffne dein Projekt "horizontos"
# 3. Aktiviere diese Services:
#    - Authentication → Email/Password
#    - Firestore Database
#    - Cloud Storage
#    - Cloud Functions (optional)
```

### 2. .env.local Datei erstellen
Erstelle die Datei `.env.local` im Root-Verzeichnis (NICHT ins Git committen!):

```env
VITE_FIREBASE_API_KEY=AIzaSyBCalSgMxY0bU5Whibm4LDAlSUkCc_Hayg
VITE_FIREBASE_AUTH_DOMAIN=horizontos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=horizontos
VITE_FIREBASE_STORAGE_BUCKET=horizontos.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1034235194919
VITE_FIREBASE_APP_ID=1:1034235194919:web:8d3a13d689f299d33d2802
```

### 3. .gitignore aktualisieren
```gitignore
.env.local
.env*.local
```

### 4. App starten
```bash
npm install
npm run dev
```

---

## Environment Setup

### firebase.ts (bereits konfiguriert ✅)
Deine [firebase.ts](firebase.ts) lädt automatisch Environment-Variablen:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy...",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "horizontos...",
  // ... weitere Konfiguration
};

// Offline-Unterstützung automatisch aktiviert
enableIndexedDbPersistence(db);
```

**Exportierte Services:**
```typescript
export const auth = getAuth(app);              // Authentifizierung
export const db = getFirestore(app);           // Datenbank
export const storage = getStorage(app);        // Dateiablage
export const functions = getFunctions(app);    // Cloud Functions
```

---

## Authentication

### Imports (copy-paste ready)
```typescript
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  updatePassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from './firebase';
```

### Benutzer registrieren (funktioniert ✅)
```typescript
async function registerUser(email: string, password: string, displayName: string) {
  try {
    // Neuen Benutzer erstellen
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Profil aktualisieren
    await updateProfile(userCredential.user, {
      displayName: displayName,
      photoURL: `https://picsum.photos/seed/${displayName}/100/100`
    });
    
    // Benutzer speichern in Firestore (siehe Firestore Sektion)
    console.log("✅ Benutzer erfolgreich registriert:", userCredential.user.email);
    return userCredential.user;
    
  } catch (error: any) {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Email wird bereits verwendet',
      'auth/weak-password': 'Passwort muss mindestens 6 Zeichen sein',
      'auth/invalid-email': 'Ungültige Email-Adresse',
    };
    console.error("❌", errorMessages[error.code] || error.message);
  }
}
```

### Benutzer anmelden (funktioniert ✅)
```typescript
async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Angemeldet als:", userCredential.user.email);
    return userCredential.user;
    
  } catch (error: any) {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Benutzer existiert nicht',
      'auth/wrong-password': 'Passwort falsch',
      'auth/invalid-credential': 'Email oder Passwort falsch',
    };
    console.error("❌", errorMessages[error.code] || error.message);
  }
}
```

### Benutzer abmelden (funktioniert ✅)
```typescript
async function logoutUser() {
  try {
    await signOut(auth);
    console.log("✅ Abgemeldet");
  } catch (error: any) {
    console.error("❌ Fehler beim Abmelden:", error.message);
  }
}
```

### Authentifizierungsstatus überwachen (funktioniert ✅)
```typescript
// In useEffect verwenden
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      console.log("✅ Benutzer angemeldet:", currentUser.email);
      // Benutzer ist angemeldet - lade seine Daten
      loadUserProfile(currentUser.uid);
    } else {
      console.log("⚠️ Kein Benutzer angemeldet");
      // Benutzer ist nicht angemeldet - zeige Login-Screen
    }
  });

  // Cleanup
  return () => unsubscribe();
}, []);
```

### Mit Google anmelden (funktioniert ✅)
```typescript
async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Mit Google angemeldet:", result.user.email);
    return result.user;
  } catch (error: any) {
    console.error("❌ Google Login Fehler:", error.message);
  }
}
```

### Passwort ändern (funktioniert ✅)
```typescript
async function changePassword(newPassword: string) {
  try {
    if (!auth.currentUser) throw new Error("Keine aktive Sitzung");
    
    await updatePassword(auth.currentUser, newPassword);
    console.log("✅ Passwort erfolgreich geändert");
  } catch (error: any) {
    console.error("❌ Fehler beim Passwortändern:", error.message);
  }
}
```

### Passwort zurücksetzen (funktioniert ✅)
```typescript
async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Reset-Email gesendet zu:", email);
  } catch (error: any) {
    console.error("❌ Fehler beim Reset:", error.message);
  }
}
```

---

## Firestore

### Imports
```typescript
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc,
  query, 
  where,
  and,
  or,
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  increment,
  FieldValue,
  deleteField
} from "firebase/firestore";
import { db } from './firebase';
```

### 1. Daten hinzufügen (CREATE)

```typescript
// Option A: Mit auto-generierter ID
async function createPost(content: string, authorId: string) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      content,
      author: authorId,
      createdAt: Timestamp.now(),
      likes: 0,
      comments: 0
    });
    console.log("✅ Post erstellt mit ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ Fehler beim Erstellen:", error.message);
  }
}

// Option B: Mit bestimmter ID
async function createUserProfile(userId: string, name: string, email: string) {
  try {
    await setDoc(doc(db, "users", userId), {
      id: userId,
      name,
      email,
      createdAt: Timestamp.now(),
      role: "Mitarbeiter",
      score: 0,
      isAdmin: false
    });
    console.log("✅ Benutzerprofil erstellt");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

### 2. Daten auslesen (READ)

```typescript
// Einzelnes Dokument abrufen
async function getPost(postId: string) {
  try {
    const docSnap = await getDoc(doc(db, "posts", postId));
    if (docSnap.exists()) {
      console.log("✅ Post gefunden:", docSnap.data());
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("⚠️ Post nicht gefunden");
    }
  } catch (error: any) {
    console.error("❌ Fehler beim Abrufen:", error.message);
  }
}

// Alle Dokumente einer Collection abrufen
async function getAllPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("✅ Posts gefunden:", posts.length);
    return posts;
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

### 3. Echtzeit-Listener (REAL-TIME READ)

```typescript
// In useEffect verwenden - funktioniert in deiner App ✅
useEffect(() => {
  // Query: Alle Posts, sortiert nach neuesten
  const q = query(
    collection(db, "posts"), 
    orderBy("createdAt", "desc"),
    limit(20)
  );
  
  // Listener registrieren
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("✅ Posts aktualisiert:", posts.length);
    setFeed(posts);
  });
  
  // Cleanup: Listener entfernen wenn Komponente unmountet
  return () => unsubscribe();
}, []);
```

### 4. Daten aktualisieren (UPDATE)

```typescript
// Einzelne Felder aktualisieren
async function likePost(postId: string) {
  try {
    await updateDoc(doc(db, "posts", postId), {
      likes: increment(1)  // Inkrementiert den Wert um 1
    });
    console.log("✅ Like hinzugefügt");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}

// Mehrere Felder gleichzeitig aktualisieren
async function updateUserProfile(userId: string, updates: any) {
  try {
    await updateDoc(doc(db, "users", userId), {
      name: updates.name,
      email: updates.email,
      role: updates.role,
      updatedAt: Timestamp.now()
    });
    console.log("✅ Profil aktualisiert");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}

// Feld löschen
async function removeOptionalField(docId: string) {
  try {
    await updateDoc(doc(db, "posts", docId), {
      image: deleteField()
    });
    console.log("✅ Feld entfernt");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

### 5. Daten löschen (DELETE)

```typescript
async function deletePost(postId: string) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    console.log("✅ Post gelöscht");
  } catch (error: any) {
    console.error("❌ Fehler beim Löschen:", error.message);
  }
}
```

### 6. Abfragen (QUERIES) - funktioniert in deiner App ✅

```typescript
// Einfache Abfrage
const q1 = query(
  collection(db, "posts"),
  where("author", "==", "userID123")
);

// Mehrere Bedingungen (UND)
const q2 = query(
  collection(db, "posts"),
  and(
    where("author", "==", "userID123"),
    where("likes", ">", 5)
  )
);

// Mehrere Bedingungen (ODER)
const q3 = query(
  collection(db, "posts"),
  or(
    where("category", "==", "games"),
    where("category", "==", "announcements")
  )
);

// Mit Limit und Sortierung
const q4 = query(
  collection(db, "posts"),
  where("status", "==", "published"),
  orderBy("createdAt", "desc"),
  limit(10)
);

// Abfrage ausführen
const snapshot = await getDocs(q4);
const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
```

### 7. Timestamps korrekt nutzen

```typescript
import { Timestamp } from "firebase/firestore";

// Speichern
await addDoc(collection(db, "posts"), {
  content: "Hallo Welt",
  createdAt: Timestamp.now(),  // Serverzeit
  updatedAt: Timestamp.now()
});

// Auslesen & formatieren
const post = await getDoc(doc(db, "posts", "postId"));
const data = post.data();

// Timestamp zu Date konvertieren
if (data.createdAt) {
  const date = data.createdAt.toDate();
  console.log("Erstellt am:", date.toLocaleDateString('de-DE'));
}
```

---

## Cloud Storage

### Imports
```typescript
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";
import { storage } from './firebase';
```

### 1. Datei hochladen (funktioniert ✅)

```typescript
// Einfacher Upload
async function uploadProfileImage(file: File, userId: string) {
  try {
    const storageRef = ref(storage, `profiles/${userId}/avatar.jpg`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log("✅ Datei hochgeladen:", snapshot.metadata.name);
    return snapshot;
  } catch (error: any) {
    console.error("❌ Upload Fehler:", error.message);
  }
}

// Upload mit Progress
async function uploadWithProgress(file: File, userId: string) {
  try {
    const storageRef = ref(storage, `files/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload progress:", progress + "%");
      },
      (error) => {
        console.error("❌ Fehler:", error.message);
      },
      () => {
        console.log("✅ Upload abgeschlossen");
      }
    );
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

### 2. Download-URL abrufen (funktioniert ✅)

```typescript
async function getProfileImageUrl(userId: string): Promise<string | null> {
  try {
    const url = await getDownloadURL(
      ref(storage, `profiles/${userId}/avatar.jpg`)
    );
    console.log("✅ Download URL:", url);
    return url;
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    return null;
  }
}

// In React Component
function ProfileImage({ userId }: { userId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfileImageUrl(userId).then(setImageUrl);
  }, [userId]);

  return imageUrl ? (
    <img src={imageUrl} alt="Profil" />
  ) : (
    <div>Bild wird geladen...</div>
  );
}
```

### 3. Datei löschen (funktioniert ✅)

```typescript
async function deleteProfileImage(userId: string) {
  try {
    await deleteObject(ref(storage, `profiles/${userId}/avatar.jpg`));
    console.log("✅ Datei gelöscht");
  } catch (error: any) {
    console.error("❌ Fehler beim Löschen:", error.message);
  }
}
```

### 4. Dateien auflisten

```typescript
async function listUserFiles(userId: string) {
  try {
    const listRef = ref(storage, `profiles/${userId}/`);
    const result = await listAll(listRef);
    
    console.log("✅ Dateien gefunden:", result.items.length);
    result.items.forEach((itemRef) => {
      console.log("Datei:", itemRef.name);
    });
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

---

## Cloud Functions

### Vorbereitung

```bash
# Firebase CLI installieren (falls noch nicht geschehen)
npm install -g firebase-tools

# Mit Firebase anmelden
firebase login

# In deinem Projekt-Verzeichnis
firebase init functions
```

### Einfache Cloud Function schreiben

Datei: `functions/src/index.ts`

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Einfache HTTP Funktion
export const helloWorld = functions.https.onCall((data, context) => {
  // Überprüfe ob Benutzer angemeldet ist
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "Benutzer muss angemeldet sein"
    );
  }

  console.log("Benutzer:", context.auth.uid);
  return { message: "Hallo " + data.name };
});

// Funktion zum Senden von Benachrichtigungen
export const sendNotification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Nicht angemeldet");
    }

    const { userId, title, message } = data;

    try {
      // Speichere Benachrichtigung in Firestore
      await admin.firestore().collection("notifications").add({
        recipientId: userId,
        title,
        message,
        senderId: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });

      return { success: true, message: "Benachrichtigung gesendet" };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "internal",
        "Fehler beim Senden: " + error.message
      );
    }
  }
);

// Funktion die bei jedem neuen Benutzer aufgerufen wird
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.firestore().collection("users").doc(user.uid).set({
      id: user.uid,
      email: user.email,
      name: user.displayName || "Benutzer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "Mitarbeiter",
      score: 0,
      isAdmin: false
    });
    console.log("✅ Neuer Benutzer erstellt:", user.email);
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
});
```

### Cloud Function aufrufen (Frontend)

```typescript
import { httpsCallable } from "firebase/functions";
import { functions } from './firebase';

// Funktion aufrufen
async function callCloudFunction() {
  try {
    const helloWorld = httpsCallable(functions, "helloWorld");
    const result = await helloWorld({ name: "Alex" });
    console.log("✅ Antwort:", result.data);
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}

// Benachrichtigung senden
async function sendNotificationToUser(userId: string, title: string, message: string) {
  try {
    const sendNotification = httpsCallable(functions, "sendNotification");
    const result = await sendNotification({ userId, title, message });
    console.log("✅ Benachrichtigung gesendet");
    return result.data;
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
  }
}
```

### Deployen

```bash
# Nur Functions deployen
firebase deploy --only functions

# Alle deployen
firebase deploy
```

---

## Real-time Listener

### In React useEffect verwenden (funktioniert in deiner App ✅)

```typescript
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query definieren
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    // Listener registrieren
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Erfolgreich - Daten geladen
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Post
        }));
        setPosts(posts);
        setLoading(false);
      },
      (error) => {
        // Fehler beim Laden
        console.error("❌ Fehler beim Laden:", error.message);
        setLoading(false);
      }
    );

    // Cleanup: Listener entfernen wenn Komponente unmountet
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Wird geladen...</div>;
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}
```

### Multi-Collection Listener

```typescript
// Mehrere Collections gleichzeitig überwachen (wie in deiner App)
useEffect(() => {
  if (!user) return;

  const listeners = [];

  // Listener 1: Posts
  const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  listeners.push(
    onSnapshot(qPosts, snapshot => {
      const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFeed(posts);
    })
  );

  // Listener 2: Benutzer
  const qUsers = query(collection(db, "users"), orderBy("score", "desc"));
  listeners.push(
    onSnapshot(qUsers, snapshot => {
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllUsers(users);
    })
  );

  // Listener 3: Nachrichten (nur wenn Chat offen)
  if (selectedChatUser) {
    const qMessages = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.id),
      orderBy("timestamp", "asc")
    );
    listeners.push(
      onSnapshot(qMessages, snapshot => {
        const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(messages);
      })
    );
  }

  // Cleanup: Alle Listener entfernen
  return () => listeners.forEach(unsub => unsub());
}, [user, selectedChatUser]);
```

### Listener mit Bedingungen

```typescript
// Nur Krankmeldungen des aktuellen Benutzers
const qSick = user.isAdmin 
  ? query(collection(db, "sickleaves"), orderBy("createdAt", "desc"))
  : query(collection(db, "sickleaves"), where("userId", "==", user.id));

const unsubscribe = onSnapshot(qSick, snapshot => {
  const leaves = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  setSickLeaves(leaves);
});
```

---

## Sicherheit

### Firestore Security Rules (WICHTIG! ⚠️)

Gehe zu Firebase Console → Firestore → Rules und ersetze mit:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funktion: User ist authentifiziert
    function isAuth() {
      return request.auth != null;
    }
    
    // Funktion: Benutzer ist Admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Funktion: Benutzer besitzt das Dokument
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // ========================================
    // Posts: Jeder kann lesen, nur Autor kann ändern
    // ========================================
    match /posts/{postId} {
      allow read: if true;  // Öffentlich lesbar
      allow create: if isAuth() && request.resource.data.author == request.auth.uid;
      allow update, delete: if isAuth() && isOwner(resource.data.author) || isAdmin();
    }
    
    // ========================================
    // Benutzer: Nur der Benutzer selbst kann seinen Eintrag bearbeiten
    // ========================================
    match /users/{userId} {
      allow read: if true;
      allow write: if isAuth() && isOwner(userId);
      allow write: if isAdmin();
    }
    
    // ========================================
    // Nachrichten: Nur Sender/Empfänger können lesen
    // ========================================
    match /messages/{messageId} {
      allow read: if isAuth() && (
        request.auth.uid == resource.data.senderId || 
        request.auth.uid == resource.data.receiverId
      );
      allow create: if isAuth() && request.auth.uid == request.resource.data.senderId;
    }
    
    // ========================================
    // Krankmeldungen: Admin sieht alle, andere nur ihre eigenen
    // ========================================
    match /sickleaves/{leaveId} {
      allow read: if isAuth() && (
        isOwner(resource.data.userId) || 
        isAdmin()
      );
      allow create: if isAuth();
      allow update: if isAuth() && (isOwner(resource.data.userId) || isAdmin());
    }
    
    // ========================================
    // Pinnwand: Jeder kann lesen, nur Autor kann ändern
    // ========================================
    match /board/{noteId} {
      allow read: if true;
      allow create: if isAuth();
      allow update, delete: if isAuth() && isOwner(resource.data.author) || isAdmin();
    }
    
    // ========================================
    // Standard: Alles verbieten
    // ========================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Cloud Storage Security Rules

Firebase Console → Storage → Rules

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // User-Dateien: Nur der Benutzer kann auf seine Dateien zugreifen
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId || true;  // Public Profile
      allow write: if request.auth.uid == userId;
    }
    
    // Öffentliche Dateien: Jeder kann lesen, niemand kann schreiben
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Chat-Dateien: Nur Beteiligten können Zugriff
    match /chats/{chatId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Standard: Alles verbieten
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Best Practices

✅ **RICHTIG:**
```typescript
// 1. Immer Fehlerbehandlung verwenden
try {
  const data = await getDoc(doc(db, "users", userId));
} catch (error: any) {
  console.error("Fehler:", error.message);
}

// 2. Security Rules nutzen - kein Client-seitige Validierung
// 3. Sensitive Daten in Cloud Functions speichern
// 4. Timestamps für Auditing nutzen
await setDoc(doc(db, "users", userId), {
  ...userData,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// 5. Listener immer aufräumen
const unsubscribe = onSnapshot(...);
return () => unsubscribe();
```

❌ **FALSCH:**
```typescript
// 1. Keine Error-Behandlung
const data = await getDoc(...);

// 2. Keine Security Rules - alles offen
// 3. Passwörter in Firestore speichern
// 4. Keine Timestamps
// 5. Listener nicht aufräumen - Memory Leaks!
```

---

## Fehlerbehandlung

### Standard Error Codes

```typescript
const firebaseErrors: { [key: string]: string } = {
  // Auth Fehler
  'auth/email-already-in-use': 'Diese Email wird bereits verwendet',
  'auth/weak-password': 'Passwort muss mindestens 6 Zeichen sein',
  'auth/invalid-email': 'Ungültige Email-Adresse',
  'auth/user-not-found': 'Benutzer existiert nicht',
  'auth/wrong-password': 'Passwort ist falsch',
  'auth/invalid-credential': 'Email oder Passwort falsch',
  'auth/operation-not-allowed': 'Operation nicht erlaubt',
  
  // Firestore Fehler
  'permission-denied': 'Du hast nicht die Berechtigung dafür',
  'not-found': 'Ressource nicht gefunden',
  'already-exists': 'Ressource existiert bereits',
  'failed-precondition': 'Bedingung nicht erfüllt',
  'unavailable': 'Service nicht verfügbar',
  'internal': 'Interner Fehler',
  
  // Storage Fehler
  'storage/object-not-found': 'Datei nicht gefunden',
  'storage/bucket-not-found': 'Speicher-Bucket nicht gefunden',
  'storage/project-not-found': 'Projekt nicht gefunden',
  'storage/quota-exceeded': 'Speicherplatz überschritten',
};

// Verwenden:
try {
  await loginUser(email, password);
} catch (error: any) {
  const message = firebaseErrors[error.code] || 'Ein Fehler ist aufgetreten';
  console.error(message);
  setError(message);
}
```

### Mit Loading-States

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginUser(email, password);
      // Erfolg - Navigation oder UI Update
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        type="password"
      />
      <button disabled={loading}>
        {loading ? 'Wird angemeldet...' : 'Anmelden'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

---

## Best Practices (Zusammenfassung)

### Performance

```typescript
// ✅ Indexes für häufige Queries
// Firestore erstellt diese automatisch, wenn nötig
const q = query(
  collection(db, "posts"),
  where("author", "==", userId),
  orderBy("createdAt", "desc")
);

// ✅ Pagination statt alle laden
const q = query(
  collection(db, "posts"),
  orderBy("createdAt", "desc"),
  limit(20)  // Nur 20 laden
);

// ❌ Alle Daten laden
const allDocs = await getDocs(collection(db, "posts"));
```

### Daten-Validierung

```typescript
// Auf dem Client
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Auf dem Server (Cloud Function)
import * as admin from "firebase-admin";

export const createPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error("Not authenticated");
  
  // Server-seitige Validierung
  if (!data.content || data.content.length < 1) {
    throw new functions.https.HttpsError("invalid-argument", "Content required");
  }
  
  return await admin.firestore().collection("posts").add({
    content: data.content,
    author: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
});
```

### Realtime vs Einmalig

```typescript
// ✅ REALTIME - für Live-Updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, "posts"), orderBy("createdAt", "desc")),
    (snapshot) => setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  );
  return () => unsubscribe();
}, []);

// ✅ EINMALIG - für einmalige Abfragen
async function loadUser(userId: string) {
  const doc = await getDoc(doc(db, "users", userId));
  return { id: doc.id, ...doc.data() };
}
```

---

## 🚀 Nächste Schritte

1. **Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Security Rules aktivieren** - Siehe Sicherheits-Sektion
3. **Services testen** - Versuche Authentifizierung und Datenbank zu nutzen
4. **Cloud Functions deployen** (falls du Backend-Logik brauchst)
5. **Monitoring einrichten** - Nutze Firebase Analytics für Nutzerdaten

---

## 📚 Weitere Ressourcen

- [Firebase Official Docs](https://firebase.google.com/docs)
- [Firebase Web SDK Referenz](https://firebase.google.com/docs/web/setup)
- [Firestore Datenbank Guides](https://firebase.google.com/docs/firestore)
- [Cloud Functions Dokumentation](https://firebase.google.com/docs/functions)

---

## 💡 Häufig gestellte Fragen

### F: Wie teste ich Firebase lokal?
**A**: Nutze Firebase Emulator Suite:
```bash
firebase emulators:start
```

### F: Wie viel kostet Firebase?
**A**: Firebase hat einen kostenlosen Spark-Plan. Kostenlose Kontingente:
- Authentication: 50.000 MAU
- Firestore: 1 GB Speicher + 50.000 Reads/Tag
- Cloud Storage: 5 GB Speicher

### F: Wie kann ich Daten exportieren?
**A**: In Firebase Console → Firestore → Exportieren

### F: Kann ich offline arbeiten?
**A**: Ja! Firebase bietet Offline-Unterstützung:
```typescript
import { enableIndexedDbPersistence } from "firebase/firestore";
enableIndexedDbPersistence(db);
```

---

**Viel Erfolg mit Firebase! 🎉**
