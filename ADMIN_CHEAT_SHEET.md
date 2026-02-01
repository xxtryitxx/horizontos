# 🚀 Admin Panel - Cheat Sheet

## Alle Befehle auf einen Blick

### Admin-Funktionen (JavaScript/TypeScript)

```typescript
// BENUTZER SPERREN
import { lockUser } from './services/firebaseService';

await lockUser('userId123', true);  // Sperren
await lockUser('userId123', false); // Entsperren

// BENUTZER LÖSCHEN
import { deleteUserAccount } from './services/firebaseService';

await deleteUserAccount('userId123');

// BENUTZER-ROLLE ÄNDERN
import { updateUserRole } from './services/firebaseService';

await updateUserRole('userId123', true);   // Zu Admin
await updateUserRole('userId123', false);  // Zu Mitarbeiter
```

### AdminPanel React Component

```typescript
import AdminPanel from './components/AdminPanel';

<AdminPanel
  allUsers={allUsers}
  currentUser={user}
  onDeleteUser={async (id) => { /* ... */ }}
  onLockUser={async (id, locked) => { /* ... */ }}
  onChangeRole={async (id, role) => { /* ... */ }}
/>
```

---

## UI Symbole Erklärt

| Symbol | Aktion | Shortcut |
|--------|--------|----------|
| 🛡️ | Rolle ändern | Klick |
| 🔒 | User sperren | Klick |
| 🔓 | User entsperren | Klick |
| 🗑️ | User löschen | Klick + Confirm |
| ↓ | Details anschauen | Klick |
| Reihe Doppelklick | Details Modal | Doppelklick |

---

## Firestore Queries (für Debugging)

```firestore
// Alle Admins
db.collection('users').where('isAdmin', '==', true)

// Alle gesperrten Benutzer
db.collection('users').where('locked', '==', true)

// Alle Mitarbeiter die nicht gesperrt sind
db.collection('users')
  .where('isAdmin', '==', false)
  .where('locked', '==', false)

// Benutzer nach Name suchen
db.collection('users')
  .where('name', '>=', 'Max')
  .where('name', '<', 'Maxz')
```

---

## Häufige Fehler Behebung

```javascript
// ❌ Fehler: Cannot read property 'locked' of undefined
// ✅ Lösung: Stellen Sie sicher, dass User.locked initialisiert ist
const user = {
  ...existingUser,
  locked: existingUser.locked ?? false
}

// ❌ Fehler: Function lockUser not exported
// ✅ Lösung: Importieren aus firebaseService
import { lockUser } from './services/firebaseService';

// ❌ Fehler: Admin kann sein eigenes Konto nicht ändern
// ✅ Lösung: Das ist gewollt! (Schutz vor Aussperrung)
// Überprüfen Sie: user.id !== currentUser?.id
```

---

## Admin-Panel Struktur

```
AdminPanel/
├── Stats Dashboard (4 Karten)
│   ├─ Gesamt Benutzer
│   ├─ Administratoren
│   ├─ Aktive
│   └─ Gesperrte
├── Search Bar
│   └─ Real-time Filtering
├── Filter Buttons
│   ├─ Rollen: Alle | Admin | Mitarbeiter
│   └─ Status: Alle | Aktiv | Gesperrt
├── User Table
│   ├─ Avatar + Name
│   ├─ Email
│   ├─ Role Badge
│   ├─ Status Badge
│   └─ Action Icons (5 Buttons)
└── Modals
    ├─ Delete Confirmation
    └─ User Details View
```

---

## Code-Snippets für häufige Aufgaben

### Alle Admins finden
```typescript
const admins = allUsers.filter(u => u.isAdmin);
console.log(`Admins: ${admins.length}`);
```

### Alle gesperrten Benutzer
```typescript
const locked = allUsers.filter(u => u.locked);
console.log(`Gesperrt: ${locked.length}`);
```

### Nach Email suchen
```typescript
const found = allUsers.find(u => u.email === 'max@example.com');
console.log(found?.name);
```

### Benutzer sperren (Batch)
```typescript
const toLock = ['id1', 'id2', 'id3'];
for (const id of toLock) {
  await lockUser(id, true);
}
```

### Statistiken berechnen
```typescript
const stats = {
  total: allUsers.length,
  admins: allUsers.filter(u => u.isAdmin).length,
  active: allUsers.filter(u => !u.locked).length,
  locked: allUsers.filter(u => u.locked).length,
  activeAdmins: allUsers.filter(u => u.isAdmin && !u.locked).length
};
console.table(stats);
```

---

## FireStore Security Rules (Empfohlen)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Nur Admins können andere Benutzer updaten
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true &&
                      request.auth.uid != userId;
      
      // Benutzer können ihr eigenes Profil updaten (außer isAdmin)
      allow update: if request.auth.uid == userId &&
                       !request.resource.data.diff(resource.data).affectedKeys().has('isAdmin') &&
                       !request.resource.data.diff(resource.data).affectedKeys().has('locked');
    }
    
    // Admin Logs (Audit Trail)
    match /adminLogs/{logId} {
      allow create: if request.auth.uid != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow read: if request.auth.uid != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

---

## Keyboard Shortcuts (wenn implementiert)

```
Ctrl + K        = Suchbox fokussieren
Enter           = Erste Aktion ausführen
Escape          = Modal schließen
Tab             = Nächstes Feld
Shift + Tab     = Vorheriges Feld
```

---

## Testing Commands

```bash
# TypeScript kompilieren
npm run build

# Errors prüfen
npm run type-check

# Hot Reload starten
npm run dev

# Production Build
npm run build && npm run preview
```

---

## Debugging im Browser

```javascript
// In Browser Console:

// Admin Panel State prüfen
window.__ADMIN_PANEL__ // (wenn global gespeichert)

// Firebase User prüfen
firebase.auth().currentUser

// Firestore Abfrage testen
db.collection('users').getDocs().then(snap => {
  snap.docs.forEach(doc => console.log(doc.data()));
});

// Admin Status prüfen
firebase.auth().currentUser.getIdTokenResult().then(idTokenResult => {
  console.log(idTokenResult.claims); // Sollte isAdmin enthalten
});
```

---

## Performance Optimierung

```typescript
// ✅ Effizient: useMemo für große Listen
const filteredUsers = useMemo(() => {
  return allUsers.filter(/* ... */);
}, [allUsers, searchTerm, roleFilter]);

// ❌ Ineffizient: Neuer Filter bei jedem Render
const filteredUsers = allUsers.filter(/* ... */);

// ✅ Effizient: Pagination für >1000 Benutzer
const itemsPerPage = 50;
const currentPage = Math.ceil(filteredUsers.length / itemsPerPage);

// ❌ Ineffizient: Alle gleichzeitig laden
await Promise.all(users.map(u => deleteUserAccount(u.id)));

// ✅ Effizient: Sequential/mit Raten-Limit
for (const user of users) {
  await deleteUserAccount(user.id);
  await new Promise(r => setTimeout(r, 100)); // 100ms delay
}
```

---

## Logging Best Practices

```typescript
// ✅ Gut
console.log('✅ Benutzer gelöscht:', userId);
console.error('❌ Fehler beim Löschen:', error.message);

// ❌ Schlecht
console.log('x');
console.log(error);

// Für Production
const logAdminAction = (action, userId, details) => {
  console.log(`[ADMIN] ${new Date().toISOString()} | ${action} | ${userId}`, details);
  // Optional: An Server senden für Audit Trail
};
```

---

## Environment Variablen

```env
# .env.local
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Zugriff im Code
import.meta.env.VITE_FIREBASE_API_KEY
```

---

## Deployment Checklist

```
□ Security Rules aktualisieren
□ Backup erstellen
□ AdminPanel getestet
□ Error Handling überprüft
□ Berechtigungen verifiziert
□ Logging implementiert
□ Performance getestet
□ HTTPS aktiviert (Production)
□ CORS konfiguriert (falls nötig)
□ Rate Limiting aktivieren
```

---

**Quick Reference Version**: v1.0  
**Zuletzt aktualisiert**: Dezember 2024  
**Admin Panel Version**: 1.0 (Production-Ready)
