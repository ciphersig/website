import { Resend } from 'resend';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface RegistrationEmailParams {
  userName: string;
  userEmail: string;
  prnNumber?: string;
  rollNo?: string;
  className?: string;
  eventName: string;
  regId: string;
}

/**
 * Send transactional email via Brevo REST API (300/day 100% Free Plan)
 */
export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  pdfBase64,
  pdfFilename,
}: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  pdfBase64?: string;
  pdfFilename?: string;
}) {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ [Brevo] API key missing.');
    return { success: false, reason: 'missing_api_key' };
  }

  const payload: any = {
    sender: { name: 'CIPHER SIG', email: 'ciphersig@gmail.com' },
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: subject,
    htmlContent: htmlContent,
  };

  if (pdfBase64) {
    payload.attachment = [
      {
        content: pdfBase64,
        name: pdfFilename || 'Certificate.pdf',
      },
    ];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [Brevo] Error sending email:', data);
      return { success: false, error: data };
    }

    console.log('✅ [Brevo] Email sent successfully to:', toEmail, data);
    return { success: true, data };
  } catch (err: any) {
    console.error('❌ [Brevo] Exception during dispatch:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. REGISTRATION LOGGED / PENDING ADMIN APPROVAL TEMPLATE
 */
export function buildRegistrationPendingTemplate({
  userName,
  userEmail,
  prnNumber,
  rollNo,
  className,
  eventName,
  regId,
}: RegistrationEmailParams): string {
  const userSlug = (userName || 'operative').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const eventSlug = (eventName || 'event').toLowerCase().replace(/[^a-z0-9]/g, '-');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Registration Logged // ${eventName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:30px 10px;width:100%;">
<tr>
<td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#0f0e0d;border:1px solid #3d301f;border-radius:8px;font-family:'Courier New',Courier,monospace;color:#ffd93d;overflow:hidden;box-shadow:0 0 35px rgba(255,217,61,0.07);">

<!-- Top bar -->
<tr>
<td style="background-color:#141210;padding:12px 20px;border-bottom:1px solid #3d301f;font-size:12px;color:#8a7a5c;">
<span style="color:#ff4d4d;font-size:13px;">●</span>&nbsp;
<span style="color:#ffd93d;font-size:13px;">●</span>&nbsp;
<span style="color:#39ff14;font-size:13px;">●</span>&nbsp;
&nbsp;&nbsp;<span style="color:#b8a37e;letter-spacing:1px;">root@access-control:~# ./register-request</span>
</td>
</tr>

<!-- Header -->
<tr>
<td style="padding:32px 30px 10px 30px;">
<p style="margin:0;font-size:12px;letter-spacing:2px;color:#8a7a5c;text-transform:uppercase;">[ SYSTEM LOG // REGISTRATION_RECEIVED ]</p>
<h1 style="margin:10px 0 0 0;font-size:24px;color:#ffd93d;letter-spacing:1.5px;font-weight:bold;">&gt; REGISTRATION_LOGGED_</h1>
<p style="margin:6px 0 0 0;font-size:12px;color:#ff9f43;letter-spacing:1px;font-weight:bold;">STATUS: PENDING ADMIN APPROVAL // UNDER REVIEW</p>
</td>
</tr>

<!-- Body text -->
<tr>
<td style="padding:18px 30px 0 30px;font-size:14px;line-height:1.7;color:#f7ecc5;">
<p style="margin:0 0 14px 0;">Operative <strong style="color:#ffffff;">${userName}</strong>, your registration request for <strong style="color:#ffd93d;">${eventName}</strong> has been recorded into the CIPHER mainframe.</p>
<p style="margin:0 0 14px 0;">Your clearance request is currently <strong style="color:#ff9f43;">under review by our security administrator team</strong>.</p>
<p style="margin:0 0 20px 0;color:#8a7a5c;font-size:13px;">// We will send you an official [ACCESS GRANTED] clearance email once an administrator approves your registration.</p>
</td>
</tr>

<!-- Operative Details Card -->
<tr>
<td style="padding:0 30px 15px 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0907;border:1px solid #33271a;border-radius:6px;padding:12px 16px;">
<tr>
<td style="font-size:12px;color:#8a7a5c;line-height:1.8;">
<span style="color:#b8a37e;">OPERATIVE:</span> <strong style="color:#ffffff;">${userName}</strong><br>
${prnNumber ? `<span style="color:#b8a37e;">PRN NUMBER:</span> <span style="color:#ffffff;">${prnNumber}</span><br>` : ''}
${rollNo ? `<span style="color:#b8a37e;">ROLL NO:</span> <span style="color:#ffffff;">${rollNo}</span><br>` : ''}
${className ? `<span style="color:#b8a37e;">CLASS:</span> <span style="color:#ffffff;">${className}</span><br>` : ''}
<span style="color:#b8a37e;">COMMUNICATION:</span> <span style="color:#f7ecc5;">${userEmail}</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- Reg ID terminal box -->
<tr>
<td style="padding:0 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#070605;border:1px dashed #5e4e2e;border-radius:6px;">
<tr>
<td style="padding:16px 18px;font-size:12px;color:#8a7a5c;">
REGISTRATION_REQUEST_ID<br>
<span style="font-size:14px;color:#ffffff;letter-spacing:1px;word-break:break-all;font-weight:bold;display:inline-block;margin-top:4px;">${regId}</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- Quote -->
<tr>
<td style="padding:24px 30px 0 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #ffd93d;">
<tr>
<td style="padding:4px 0 4px 16px;font-size:13px;font-style:italic;color:#e8d89b;line-height:1.6;">
"Patience is a virtue in encryption. Your request is queued for clearance."
</td>
</tr>
</table>
</td>
</tr>

<!-- Footer instruction -->
<tr>
<td style="padding:24px 30px 8px 30px;font-size:13px;color:#f7ecc5;line-height:1.6;">
No action is required right now. Sit tight until admin verification completes.
</td>
</tr>

<tr>
<td style="padding:0 30px 30px 30px;font-size:13px;color:#8a7a5c;">
CIPHER Security Ops<br>
<span style="color:#ffd93d;font-weight:bold;">— access-control</span>
</td>
</tr>

<!-- bottom bar -->
<tr>
<td style="background-color:#141210;padding:10px 20px;border-top:1px solid #3d301f;font-size:11px;color:#5c4c3a;letter-spacing:0.5px;">
[connection secure] [session: ${userSlug}@${eventSlug}] [status: 202 PENDING_APPROVAL]
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

/**
 * 2. ACCESS GRANTED / APPROVED TEMPLATE
 */
export function buildAccessGrantedTemplate({
  userName,
  userEmail,
  prnNumber,
  rollNo,
  className,
  eventName,
  regId,
}: RegistrationEmailParams): string {
  const userSlug = (userName || 'operative').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const eventSlug = (eventName || 'event').toLowerCase().replace(/[^a-z0-9]/g, '-');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access Granted // ${eventName}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:30px 10px;width:100%;">
<tr>
<td align="center">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#0d0f0d;border:1px solid #1f3d1f;border-radius:8px;font-family:'Courier New',Courier,monospace;color:#39ff14;overflow:hidden;box-shadow:0 0 35px rgba(57,255,20,0.07);">

<!-- Top bar -->
<tr>
<td style="background-color:#101410;padding:12px 20px;border-bottom:1px solid #1f3d1f;font-size:12px;color:#5c8a5c;">
<span style="color:#ff4d4d;font-size:13px;">●</span>&nbsp;
<span style="color:#ffd93d;font-size:13px;">●</span>&nbsp;
<span style="color:#39ff14;font-size:13px;">●</span>&nbsp;
&nbsp;&nbsp;<span style="color:#7eb87e;letter-spacing:1px;">root@access-control:~# ./auth-verify</span>
</td>
</tr>

<!-- Header -->
<tr>
<td style="padding:32px 30px 10px 30px;">
<p style="margin:0;font-size:12px;letter-spacing:2px;color:#5c8a5c;text-transform:uppercase;">[ SYSTEM LOG // AUTH_EVENT ]</p>
<h1 style="margin:10px 0 0 0;font-size:26px;color:#39ff14;letter-spacing:1.5px;font-weight:bold;">&gt; ACCESS_GRANTED_</h1>
<p style="margin:6px 0 0 0;font-size:12px;color:#39ff14;letter-spacing:1px;font-weight:bold;">STATUS: APPROVED // CLEARANCE GRANTED</p>
</td>
</tr>

<!-- Body text -->
<tr>
<td style="padding:18px 30px 0 30px;font-size:14px;line-height:1.7;color:#c8f7c5;">
<p style="margin:0 0 14px 0;">User <strong style="color:#ffffff;">${userName}</strong> authenticated successfully.</p>
<p style="margin:0 0 14px 0;">Clearance confirmed for event: <strong style="color:#39ff14;">${eventName}</strong></p>
<p style="margin:0 0 20px 0;color:#5c8a5c;font-size:13px;">// Your registration has been APPROVED by the administrator. Credentials logged below.</p>
</td>
</tr>

<!-- Operative Details Card -->
<tr>
<td style="padding:0 30px 15px 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#070a07;border:1px solid #1a331a;border-radius:6px;padding:12px 16px;">
<tr>
<td style="font-size:12px;color:#5c8a5c;line-height:1.8;">
<span style="color:#7eb87e;">OPERATIVE:</span> <strong style="color:#ffffff;">${userName}</strong><br>
${prnNumber ? `<span style="color:#7eb87e;">PRN NUMBER:</span> <span style="color:#ffffff;">${prnNumber}</span><br>` : ''}
${rollNo ? `<span style="color:#7eb87e;">ROLL NO:</span> <span style="color:#ffffff;">${rollNo}</span><br>` : ''}
${className ? `<span style="color:#7eb87e;">CLASS:</span> <span style="color:#ffffff;">${className}</span><br>` : ''}
<span style="color:#7eb87e;">COMMUNICATION:</span> <span style="color:#c8f7c5;">${userEmail}</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- Reg ID terminal box -->
<tr>
<td style="padding:0 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050705;border:1px dashed #2e5e2e;border-radius:6px;">
<tr>
<td style="padding:16px 18px;font-size:12px;color:#5c8a5c;">
REGISTRATION_ID<br>
<span style="font-size:14px;color:#ffffff;letter-spacing:1px;word-break:break-all;font-weight:bold;display:inline-block;margin-top:4px;">${regId}</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- Quote -->
<tr>
<td style="padding:24px 30px 0 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #39ff14;">
<tr>
<td style="padding:4px 0 4px 16px;font-size:13px;font-style:italic;color:#9be89b;line-height:1.6;">
"The system doesn't open doors for everyone. Today, it opened one for you."
</td>
</tr>
</table>
</td>
</tr>

<!-- Footer instruction -->
<tr>
<td style="padding:24px 30px 8px 30px;font-size:13px;color:#c8f7c5;line-height:1.6;">
Present this ID at entry. No QR, no key card — just this string.
</td>
</tr>

<tr>
<td style="padding:0 30px 30px 30px;font-size:13px;color:#5c8a5c;">
See you on the inside.<br>
<span style="color:#39ff14;font-weight:bold;">— access-control</span>
</td>
</tr>

<!-- bottom bar -->
<tr>
<td style="background-color:#101410;padding:10px 20px;border-top:1px solid #1f3d1f;font-size:11px;color:#3a5c3a;letter-spacing:0.5px;">
[connection secure] [session: ${userSlug}@${eventSlug}] [status: 200 OK]
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

/**
 * Dispatch Pending Registration Email
 */
export async function sendRegistrationPendingEmail(params: RegistrationEmailParams) {
  const html = buildRegistrationPendingTemplate(params);
  const subject = `[REGISTRATION LOGGED] Clearance Pending // ${params.eventName}`;

  // 1. Try Brevo API first (100% Free 300/day plan, sends to any recipient)
  const brevoRes = await sendBrevoEmail({
    toEmail: params.userEmail,
    toName: params.userName,
    subject,
    htmlContent: html,
  });

  if (brevoRes.success) {
    return brevoRes;
  }

  // 2. Fallback to Resend if Brevo is unavailable
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'access-control <onboarding@resend.dev>',
        to: [params.userEmail],
        subject,
        html,
      });
      return { success: !error, data, error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return brevoRes;
}

/**
 * Dispatch Access Granted / Approved Email
 */
export async function sendAccessGrantedEmail(params: RegistrationEmailParams) {
  const html = buildAccessGrantedTemplate(params);
  const subject = `[ACCESS GRANTED] Clearance Confirmed // ${params.eventName}`;

  // 1. Try Brevo API first (100% Free 300/day plan, sends to any recipient)
  const brevoRes = await sendBrevoEmail({
    toEmail: params.userEmail,
    toName: params.userName,
    subject,
    htmlContent: html,
  });

  if (brevoRes.success) {
    return brevoRes;
  }

  // 2. Fallback to Resend if Brevo is unavailable
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'access-control <onboarding@resend.dev>',
        to: [params.userEmail],
        subject,
        html,
      });
      return { success: !error, data, error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return brevoRes;
}

// Backward compatibility alias
export const sendRegistrationConfirmationEmail = sendRegistrationPendingEmail;
