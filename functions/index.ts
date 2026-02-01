
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

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
