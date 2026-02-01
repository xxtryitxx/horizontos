import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple handler without external dependencies to avoid issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const body = req.body || {};
  const to = body.to;
  const subject = body.subject || 'HorizontOS Notification';
  const text = body.text || '';

  if (!to) {
    return res.status(400).json({ ok: false, error: 'Missing recipient email' });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not configured');
    return res.status(500).json({ ok: false, error: 'SendGrid not configured' });
  }

  try {
    const from = process.env.SENDGRID_FROM || 'no-reply@horizontos.local';

    // Call SendGrid API directly via fetch
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [
          {
            type: 'text/plain',
            value: text,
          },
          {
            type: 'text/html',
            value: `<p>${String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', response.status, error);
      return res.status(500).json({ ok: false, error: 'Failed to send email' });
    }

    console.log('✅ Email sent to', to);
    return res.status(200).json({ ok: true, message: 'Email sent' });
  } catch (err: any) {
    console.error('❌ Error sending email:', err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
