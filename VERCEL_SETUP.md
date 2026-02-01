# Vercel Deployment für HorizontOS

## 1) Vercel CLI installieren (falls nicht geschehen)

```bash
npm install -g vercel
```

## 2) Mit Vercel-Account anmelden

```bash
vercel login
```

## 3) Link dein Projekt

Da du die Projekt-ID hast (`prj_Z37Dq7tQG3XhHMvhtycMlMxn0KcJ`), kann der Link schon bestehen. Prüfe mit:

```bash
vercel projects list
```

Falls nicht gelinkt: mit GitHub/Git-Repo verbunden? Falls ja, öffne https://vercel.com/dashboard und wähle das Projekt.

## 4) Setze Environment Variables

### Option A: Via CLI (lokal)

```bash
vercel env add SENDGRID_API_KEY
# Gib deinen SendGrid API Key ein (z.B. SG.abc123...)

vercel env add SENDGRID_FROM
# Gib die "From" E-Mail ein (z.B. no-reply@yourdomain.com)
```

### Option B: Via Web UI

1. Gehe zu https://vercel.com/dashboard
2. Wähle dein Projekt
3. Settings → Environment Variables
4. Klick "+ Add"
   - Name: `SENDGRID_API_KEY` / Value: `SG.abc123...`
   - Name: `SENDGRID_FROM` / Value: `no-reply@yourdomain.com`

## 5) Deploy

```bash
vercel --prod
```

Das wird:
- Repo hochladen
- Dependencies installieren (`npm install`)
- Build ausführen (`npm run build`)
- React-App + API-Route (`/api/sendNotificationEmail`) auf Vercel deployen

Output zeigt dir die URL, z.B. `https://horizontos.vercel.app`.

## 6) Test der API

Sobald deployed, teste die Mail-Route:

```bash
curl -X POST https://horizontos.vercel.app/api/sendNotificationEmail \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Hallo Vercel!"}'
```

Sollte `{"ok":true}` zurückgeben (und E-Mail an `test@example.com`).

## 7) In der App testen

- App öffnen: https://horizontos.vercel.app
- Melde dich an
- Erstelle eine Schicht-Tausch-Anfrage
- Der App sendet automatisch POST zu `/api/sendNotificationEmail`
- Prüfe die Vercel-Logs:
  ```bash
  vercel logs sendNotificationEmail --prod
  ```

## Fehlerbehebung

- **404 auf `/api/sendNotificationEmail`**: Stelle sicher, dass `api/sendNotificationEmail.ts` vorhanden ist.
- **SendGrid Error**: Prüfe `SENDGRID_API_KEY` in Vercel Settings; teste API-Key direkt.
- **Keine Mail ankommen**: Logs checken (`vercel logs`), evtl. an Spam-Ordner.

---

**Deine Projekt-ID ist:** `prj_Z37Dq7tQG3XhHMvhtycMlMxn0KcJ`
