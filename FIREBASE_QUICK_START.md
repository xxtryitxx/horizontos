# Firebase Integration - Quick Start Checkliste

## ✅ Schritt-für-Schritt Setup

### 1. Firebase Project Setup (5 Min)
- [ ] Gehe zu https://console.firebase.google.com
- [ ] Öffne Projekt "horizontos"
- [ ] Aktiviere **Authentication** → Email/Password
- [ ] Aktiviere **Firestore Database**
- [ ] Aktiviere **Cloud Storage**
- [ ] Kopiere deine Projekt-ID und API-Key

### 2. Lokale Konfiguration (2 Min)
```bash
# Kopiere die Beispiel-Datei
cp .env.local.example .env.local

# Bearbeite .env.local mit deinen Firebase-Credentials
# (Die Werte sind bereits vorgefüllt, aber überprüfe sie)
```

### 3. Security Rules (5 Min)
- [ ] Gehe zu Firestore → Rules
- [ ] Kopiere die Rules aus [FIREBASE_ANLEITUNG.md](FIREBASE_ANLEITUNG.md#firestore-security-rules)
- [ ] Veröffentliche (Publish)

**Genauso für Storage:**
- [ ] Gehe zu Storage → Rules
- [ ] Kopiere die Storage Rules aus der Anleitung
- [ ] Veröffentliche

### 4. Firebase Service testen
```typescript
// In deinem Code verwenden:
import { loginUser, registerUser, createPost } from './services/firebaseService';

// Benutzer registrieren
await registerUser("test@example.com", "password123", "TestUser");

// Benutzer anmelden
await loginUser("test@example.com", "password123");

// Post erstellen
await createPost("Hallo Welt!", currentUserId);
```

### 5. App starten
```bash
npm install
npm run dev
```

---

## 📚 Dokumentation

- **Komplette Anleitung:** [FIREBASE_ANLEITUNG.md](FIREBASE_ANLEITUNG.md)
- **Ready-to-Use Funktionen:** [services/firebaseService.ts](services/firebaseService.ts)
- **Firebase Konfiguration:** [firebase.ts](firebase.ts)
- **Types/Interfaces:** [types.ts](types.ts)

---

## 🔧 Häufige Aufgaben

### Benutzer registrieren
```typescript
import { registerUser } from './services/firebaseService';

await registerUser(email, password, displayName);
```

### Post erstellen
```typescript
import { createPost } from './services/firebaseService';

const postId = await createPost(content, userId);
```

### Posts in Echtzeit laden
```typescript
import { onPostsUpdated } from './services/firebaseService';

useEffect(() => {
  const unsubscribe = onPostsUpdated((posts) => {
    setPosts(posts);
  });
  return () => unsubscribe();
}, []);
```

### Profil aktualisieren
```typescript
import { updateUserProfile } from './services/firebaseService';

await updateUserProfile(userId, {
  name: "Neuer Name",
  role: "Admin"
});
```

---

## ⚠️ Wichtig

**NIEMALS diese Datei committen:**
- `.env.local` - Enthält deine API Keys!

**Security Rules MÜSSEN gesetzt sein:**
- Ohne Rules können alle Daten lesen/schreiben
- Siehe [FIREBASE_ANLEITUNG.md](FIREBASE_ANLEITUNG.md#sicherheit)

**Offline-Persistierung ist automatisch aktiviert:**
- Die App funktioniert auch ohne Internet
- Daten werden automatisch synchronisiert wenn online

---

## 🐛 Fehlerbehandlung

Alle Funktionen in `firebaseService.ts` werfen Errors, die du abfangen solltest:

```typescript
try {
  await loginUser(email, password);
} catch (error: any) {
  console.error("Fehler:", error.message);
  // Benutzer wird informiert
}
```

---

## 📞 Weitere Hilfe

- [Firebase Official Docs](https://firebase.google.com/docs)
- [Firestore Guides](https://firebase.google.com/docs/firestore)
- [Authentication Docs](https://firebase.google.com/docs/auth)
- [Storage Docs](https://firebase.google.com/docs/storage)

---

**Viel Erfolg mit Firebase! 🚀**
