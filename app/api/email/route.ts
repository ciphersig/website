import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { sendBrevoEmail, buildAccessGrantedTemplate, buildRegistrationPendingTemplate } from '@/app/utils/emailService';

export const dynamic = 'force-dynamic';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  try {
    const { type, regId, studentEmail, studentName, eventName, pdfBase64 } = await request.json();

    if (!regId) {
      return NextResponse.json({ error: 'Missing regId' }, { status: 400 });
    }

    let toEmail = studentEmail || 'student@example.com';
    let toName = studentName || 'Student';
    let toEvent = eventName || 'an Event';

    let subject = '';
    let htmlContent = '';

    if (type === 'pending' || type === 'registration_pending') {
      subject = `[REGISTRATION LOGGED] Clearance Pending // ${toEvent}`;
      htmlContent = buildRegistrationPendingTemplate({
        userName: toName,
        userEmail: toEmail,
        eventName: toEvent,
        regId: regId,
      });
    } else if (type === 'registration' || type === 'access_granted' || type === 'approved') {
      subject = `[ACCESS GRANTED] Clearance Confirmed // ${toEvent}`;
      htmlContent = buildAccessGrantedTemplate({
        userName: toName,
        userEmail: toEmail,
        eventName: toEvent,
        regId: regId,
      });
    } else if (type === 'certificate') {
      subject = `Certificate of Attendance: ${toEvent}`;
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="color: #2563eb;">Certificate of Attendance</h1>
          <p>This is to certify that</p>
          <h2>${toName}</h2>
          <p>has successfully attended the event</p>
          <h3>${toEvent}</h3>
          <p>Congratulations and thank you for your participation!</p>
          <div style="margin-top: 40px; font-size: 12px; color: #666;">
            Registration ID: ${regId}
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // 1. Try Brevo (Free plan, 300 emails/day, no recipient restriction)
    const brevoResult = await sendBrevoEmail({
      toEmail,
      toName,
      subject,
      htmlContent,
      pdfBase64: pdfBase64 || undefined,
      pdfFilename: `${toName.replace(/\s+/g, '_')}_Certificate.pdf`,
    });

    if (brevoResult.success) {
      return NextResponse.json({ success: true, data: brevoResult.data });
    }

    // 2. Fallback to Resend if configured
    if (resend) {
      const emailPayload: any = {
        from: 'access-control <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html: htmlContent,
      };

      if (pdfBase64) {
        emailPayload.attachments = [
          {
            filename: `${toName.replace(/\s+/g, '_')}_Certificate.pdf`,
            content: pdfBase64,
          },
        ];
      }

      const { data, error } = await resend.emails.send(emailPayload);
      if (!error) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: brevoResult.success, error: brevoResult.error });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
