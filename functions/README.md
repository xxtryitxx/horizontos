Setup für Cloud Functions (E‑Mail-Benachrichtigungen)

1) Installiere Abhängigkeiten im `functions/` Ordner:

```bash
cd functions
npm install
```

2) SendGrid API-Key konfigurieren (empfohlen):

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" sendgrid.from="no-reply@yourdomain.com"
```

Alternativ kannst du Umgebungsvariablen setzen (`SENDGRID_API_KEY`, `SENDGRID_FROM`).

3) Deploy der Functions:

```bash
cd functions
npm run build # optional, falls Typescript
firebase deploy --only functions
```

4) Testen (lokal):
- Du kannst in der Firebase Console eine Dokument in `notifications/` anlegen (type enthält `shift`), oder
- folgendes Node-Skript ausführen (im Projekt-Root):

```js
// quick-test-create-notif.js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
(async () => {
  const db = admin.firestore();
  const res = await db.collection('notifications').add({
    userId: 'RECIPIENT_UID',
    type: 'shift_swap',
    title: 'Schichttausch',
    message: 'Test: Du hast eine neue Schichttausch-Anfrage',
    read: false,
    createdAt: admin.firestore.Timestamp.now()
  });
  console.log('Created notification', res.id);
})();
```

Hinweis: Stelle sicher, dass `@sendgrid/mail` installiert ist und die API-Key korrekt gesetzt ist, sonst werden die E‑Mails nicht gesendet, die Function aber trotzdem deployed.
