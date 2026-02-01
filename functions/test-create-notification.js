const admin = require('firebase-admin');
admin.initializeApp();

(async () => {
  const db = admin.firestore();
  const res = await db.collection('notifications').add({
    userId: process.argv[2] || 'RECIPIENT_UID',
    type: 'shift_swap',
    title: 'Schichttausch (Test)',
    message: 'Dies ist ein Test für Schichttausch-Benachrichtigung.',
    read: false,
    createdAt: admin.firestore.Timestamp.now()
  });
  console.log('Created notification', res.id);
  process.exit(0);
})();
