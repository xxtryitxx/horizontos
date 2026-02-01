Vercel Deployment & SendGrid setup

1) Create a Vercel project (connect to your repo) or `vercel` from CLI.

2) Set environment variables in Vercel (Project Settings → Environment Variables):

- `SENDGRID_API_KEY` = your SendGrid API key
- `SENDGRID_FROM` = no-reply@yourdomain.com

3) The API route is at `/api/sendNotificationEmail`. The frontend will POST to this route when a notification is created.

4) Deploy:
```bash
# from repo root
vercel --prod
```

5) Test: create a notification in the app (trigger a shift-swap). The app will write `notifications/` in Firestore and attempt to POST to `/api/sendNotificationEmail` with the recipient email. Check Vercel function logs if mail not sent.

Security note: The API endpoint accepts requests from the client; consider adding a simple HMAC/APIToken check if you want to restrict who can call it. Store the token in Vercel as `NOTIF_API_TOKEN` and have the client include it in the POST header `x-notif-token`.
