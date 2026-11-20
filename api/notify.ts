// POST /api/notify — emails website form submissions (Request a Callback, client
// onboarding) to the PMS desk over SMTP.
//
// Runs server-side only:
//   • Production: Vercel serverless function (this file, auto-detected under /api).
//   • Local dev:  served by the Vite dev server (see vite.config.ts → notifyApiDev).
//
// All settings come from environment variables — NEVER prefix them with VITE_,
// or Vite would bundle the password into the public JavaScript:
//   SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM, NOTIFY_TO
// Locally they live in `.env` (git-ignored); in production set them in
// Vercel → Project → Settings → Environment Variables.

import type { IncomingMessage, ServerResponse } from 'node:http';
import nodemailer from 'nodemailer';

type Req = IncomingMessage & { body?: unknown };

const MAX_BODY = 32 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const clip = (v: unknown, n = 2000) => (v == null ? '' : String(v).slice(0, n));

const row = (label: string, value: unknown) =>
  clip(value).trim() === ''
    ? ''
    : `<tr><td style="padding:6px 16px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0"><b>${esc(clip(value))}</b></td></tr>`;

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJson(req: Req): Promise<any> {
  // Vercel pre-parses JSON into req.body; the Vite dev middleware does not.
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('Payload too large');
  }
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'POST only' });

  const env = process.env;
  const password = env.SMTP_PASSWORD;
  if (!password) return send(res, 500, { ok: false, error: 'SMTP_PASSWORD is not configured' });

  const host = env.SMTP_HOST || 'smtp.falconide.com';
  const port = Number(env.SMTP_PORT || 465);
  const user = env.SMTP_USERNAME || 'acmmails';
  const from = env.SMTP_FROM || 'donotreply@acm.co.in';
  // Recipient is fixed server-side (never taken from the request) so this public
  // endpoint can't be abused to send mail to arbitrary addresses.
  const to = env.NOTIFY_TO || 'pms@acm.co.in';

  let payload: any;
  try {
    payload = await readJson(req);
  } catch {
    return send(res, 400, { ok: false, error: 'Invalid request body' });
  }
  const type = clip(payload?.type, 40);
  const s = payload?.submission ?? {};
  const name = clip(s.fullName ?? s.name, 200).trim();
  if (!name || (!clip(s.mobile).trim() && !clip(s.email).trim())) {
    return send(res, 400, { ok: false, error: 'Name and a contact detail are required' });
  }

  const isCallback = type === 'callback';
  const subject = isCallback
    ? `Callback request — ${name}`
    : type === 'client_onboarding'
      ? `New client onboarding — ${name}`
      : `New website submission (${type || 'general'})`;

  const rows = isCallback
    ? [
        row('Name', name),
        row('Mobile', s.mobile),
        row('Email', s.email),
        row('I am', s.visitorType),
        row('Investment corpus', s.corpus),
        row('City', s.city),
        row('Message', s.message),
      ].join('')
    : [
        row('Name', name),
        row('Email', s.email),
        row('Mobile', s.mobile),
        row('PAN', s.pan),
        row('Notes', s.notes),
      ].join('');

  const docs = Array.isArray(s.documents)
    ? s.documents
        .slice(0, 20)
        .map((d: { label?: string; fileName?: string }) => `<li>${esc(clip(d?.label, 100))} — ${esc(clip(d?.fileName, 200))}</li>`)
        .join('')
    : '';

  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;color:#1B1140">
      <h2 style="color:#E4611F;margin:0 0 12px">${esc(subject)}</h2>
      <table style="border-collapse:collapse">${rows}</table>
      ${docs ? `<h3 style="margin:16px 0 6px">Documents uploaded</h3><ul>${docs}</ul>
      <p style="color:#94a3b8;font-size:12px">Files are in the private <b>onboarding</b> storage bucket.</p>` : ''}
      <p style="color:#94a3b8;font-size:12px;margin-top:16px">Submitted ${esc(submittedAt)} IST via the ACE PMS website.</p>
    </div>`;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // implicit TLS on 465; STARTTLS on 587/2525
      auth: { user, pass: password },
    });
    const info = await transporter.sendMail({
      from: `ACE PMS Website <${from}>`,
      to,
      replyTo: typeof s.email === 'string' && EMAIL_RE.test(s.email) ? s.email : undefined,
      subject,
      html,
      text,
    });
    return send(res, 200, { ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('[api/notify] send failed:', err);
    return send(res, 502, { ok: false, error: 'Email could not be sent' });
  }
}
