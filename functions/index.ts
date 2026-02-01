
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Optional: SendGrid email for notification emails. Configure via environment
// `functions.config().sendgrid.key` or set SENDGRID_API_KEY in process.env.
let sgMail: any = null;
try {
  // lazy load to avoid hard dependency at local dev if not installed
  // developer deploying should `npm install @sendgrid/mail` in the functions folder
  // and set the API key via `firebase functions:config:set sendgrid.key="YOUR_KEY"`
  // or via environment variable SENDGRID_API_KEY
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sgMail = require('@sendgrid/mail');
  const key = (functions.config() && functions.config().sendgrid && functions.config().sendgrid.key) || process.env.SENDGRID_API_KEY;
  if (key) sgMail.setApiKey(key);
} catch (e) {
  console.warn('SendGrid not installed or not configured. Email notifications will be disabled.', e?.message || e);
}

export const setUserRole = functions.region('europe-west3').https.onCall(async (data, context) => {
  // Nur Admins dürfen Rollen ändern!
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Nicht angemeldet.");
  }

  const callerUid = context.auth.uid;
  const caller = await admin.auth().getUser(callerUid);
  // Wir prüfen sowohl auf den claim "admin" als auch auf "role === 'admin'" zur Sicherheit
  const isAdmin = caller.customClaims?.admin === true || caller.customClaims?.role === 'admin';

  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Nur Admins dürfen Rollen setzen.");
  }

  const { targetUid, role } = data; // role = "admin" | "mitarbeiter"

  if (!["admin", "mitarbeiter"].includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Ungültige Rolle.");
  }

  // Bestehende Claims holen und updaten (additiv)
  const user = await admin.auth().getUser(targetUid);
  const currentClaims = user.customClaims || {};

  await admin.auth().setCustomUserClaims(targetUid, {
    ...currentClaims,
    role: role,
    admin: role === 'admin' // Setzt zusätzlich den boolean Flag für einfachere Abfragen
  });

  return { success: true, message: `Rolle ${role} für ${targetUid} gesetzt.` };
});

// Firestore trigger: send E-Mail when a notification of type 'shift_swap' or containing 'shift' is created
export const sendNotificationEmail = functions.region('europe-west3').firestore
  .document('notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const notif = snap.data();
    if (!notif) return null;

    const notifType = (notif.type || '').toString().toLowerCase();
    // Only send emails for shift related notifications (swap/shift)
    if (!notifType.includes('shift') && !notifType.includes('swap')) return null;

    // Guard: sendgrid must be configured
    if (!sgMail || !sgMail.setApiKey) {
      console.warn('SendGrid not available, skipping email for notification', context.params.notifId);
      return null;
    }

    try {
      const userId = notif.userId;
      const userSnap = await admin.firestore().collection('users').doc(userId).get();
      if (!userSnap.exists) {
        console.warn('Recipient user not found for notification email', userId);
        return null;
      }
      const userData: any = userSnap.data();
      const toEmail = userData.email;
      if (!toEmail) {
        console.warn('User has no email, skipping notification email', userId);
        return null;
      }

      const fromEmail = (functions.config() && functions.config().sendgrid && functions.config().sendgrid.from) || process.env.SENDGRID_FROM || 'no-reply@horizontos.local';

      const msg = {
        to: toEmail,
        from: fromEmail,
        subject: notif.title || 'Neue Benachrichtigung',
        text: notif.message || '',
        html: `<p>${notif.message || ''}</p><p><small>Diese E-Mail wurde automatisch gesendet.</small></p>`,
      };

      await sgMail.send(msg);
      console.log('Email sent for notification', context.params.notifId, 'to', toEmail);
    } catch (err: any) {
      console.error('Failed to send notification email:', err?.message || err);
    }

    return null;
  });
