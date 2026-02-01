/**
 * Firebase Service - Alle häufig verwendeten Funktionen
 * Copy-Paste ready für deine App
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
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
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  increment,
  deleteField,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../firebase";

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export async function registerUser(email: string, password: string, displayName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName,
      photoURL: `https://picsum.photos/seed/${displayName}/100/100`,
    });

    // Benutzer in Firestore speichern
    await setDoc(doc(db, "users", userCredential.user.uid), {
      id: userCredential.user.uid,
      name: displayName,
      email,
      role: "Mitarbeiter",
      avatar: `https://picsum.photos/seed/${displayName}/100/100`,
      score: 0,
      isAdmin: false,
      createdAt: Timestamp.now(),
    });

    console.log("✅ Benutzer registriert:", email);
    return userCredential.user;
  } catch (error: any) {
    const errorMessages: { [key: string]: string } = {
      "auth/email-already-in-use": "Email wird bereits verwendet",
      "auth/weak-password": "Passwort muss mindestens 6 Zeichen sein",
      "auth/invalid-email": "Ungültige Email-Adresse",
    };
    console.error("❌", errorMessages[error.code] || error.message);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Angemeldet als:", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    const errorMessages: { [key: string]: string } = {
      "auth/user-not-found": "Benutzer existiert nicht",
      "auth/wrong-password": "Passwort falsch",
      "auth/invalid-credential": "Email oder Passwort falsch",
    };
    console.error("❌", errorMessages[error.code] || error.message);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    console.log("✅ Abgemeldet");
  } catch (error: any) {
    console.error("❌ Fehler beim Abmelden:", error.message);
    throw error;
  }
}

export async function changePassword(newPassword: string) {
  try {
    if (!auth.currentUser) throw new Error("Keine aktive Sitzung");
    await updatePassword(auth.currentUser, newPassword);
    console.log("✅ Passwort geändert");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Reset-Email gesendet zu:", email);
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// ============================================
// FIRESTORE FUNCTIONS
// ============================================

// CREATE
export async function createPost(content: string, authorId: string) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      content,
      author: authorId,
      createdAt: Timestamp.now(),
      likes: 0,
      comments: 0,
    });
    console.log("✅ Post erstellt");
    return docRef.id;
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// READ - Single Document
export async function getPost(postId: string) {
  try {
    const docSnap = await getDoc(doc(db, "posts", postId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// READ - Multiple Documents
export async function getAllPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// READ - With Query
export async function getPostsByAuthor(authorId: string) {
  try {
    const q = query(
      collection(db, "posts"),
      where("author", "==", authorId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// UPDATE
export async function likePost(postId: string) {
  try {
    await updateDoc(doc(db, "posts", postId), {
      likes: increment(1),
    });
    console.log("✅ Like hinzugefügt");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Profil aktualisiert");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// DELETE
export async function deletePost(postId: string) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    console.log("✅ Post gelöscht");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// ============================================
// REALTIME LISTENERS
// ============================================

export function onPostsUpdated(callback: (posts: any[]) => void) {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(posts);
    },
    (error) => {
      console.error("❌ Listener Fehler:", error.message);
    }
  );
}

export function onUsersUpdated(callback: (users: any[]) => void) {
  const q = query(collection(db, "users"), orderBy("score", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(users);
    },
    (error) => {
      console.error("❌ Listener Fehler:", error.message);
    }
  );
}

// ============================================
// CLOUD STORAGE FUNCTIONS
// ============================================

export async function uploadProfileImage(file: File, userId: string) {
  try {
    const storageRef = ref(storage, `profiles/${userId}/avatar.jpg`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log("✅ Datei hochgeladen");
    return snapshot;
  } catch (error: any) {
    console.error("❌ Upload Fehler:", error.message);
    throw error;
  }
}

export async function getProfileImageUrl(userId: string): Promise<string | null> {
  try {
    const url = await getDownloadURL(ref(storage, `profiles/${userId}/avatar.jpg`));
    return url;
  } catch (error: any) {
    console.warn("⚠️ Keine Profilbild-URL gefunden");
    return null;
  }
}

export async function deleteProfileImage(userId: string) {
  try {
    await deleteObject(ref(storage, `profiles/${userId}/avatar.jpg`));
    console.log("✅ Datei gelöscht");
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

// ============================================
// UTILS
// ============================================

export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ============================================
// USER MANAGEMENT FUNCTIONS (Admin)
// ============================================

export async function lockUser(userId: string, shouldLock: boolean) {
  try {
    await updateDoc(doc(db, "users", userId), {
      locked: shouldLock,
      lockedAt: shouldLock ? Timestamp.now() : deleteField(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Benutzer ${shouldLock ? 'gesperrt' : 'entsperrt'}`);
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    // Lösche User-Dokument aus Firestore
    await deleteDoc(doc(db, "users", userId));
    
    // Lösche User-Daten (Posts, Messages, etc.)
    const postsQuery = query(
      collection(db, "posts"),
      where("author", "==", userId)
    );
    const postsSnap = await getDocs(postsQuery);
    for (const docSnap of postsSnap.docs) {
      await deleteDoc(doc(db, "posts", docSnap.id));
    }
    
    console.log("✅ Benutzer gelöscht");
  } catch (error: any) {
    console.error("❌ Fehler beim Löschen:", error.message);
    throw error;
  }
}

export async function updateUserRole(userId: string, isAdmin: boolean) {
  try {
    await updateDoc(doc(db, "users", userId), {
      isAdmin,
      role: isAdmin ? "Administrator" : "Mitarbeiter",
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Rolle aktualisiert`);
  } catch (error: any) {
    console.error("❌ Fehler:", error.message);
    throw error;
  }
}
