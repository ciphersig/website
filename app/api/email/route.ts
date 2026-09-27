import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { supabase } from '@/app/utils/supabase';
import { buildAccessGrantedTemplate, buildRegistrationPendingTemplate } from '@/app/utils/emailService';

// Create a Resend instance. Ensure RESEND_API_KEY is in your .env.local
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const { type, regId, studentEmail, studentName, eventName, pdfBase64 } = await request.json();

    if (!regId) {
      return NextResponse.json({ error: 'Missing regId' }, { status: 400 });
    }

    // Generate QR Code Data URI
    const qrDataUrl = await QRCode.toDataURL(regId, {
      color: { dark: '#000000', light: '#ffffff' },
      width: 300
    });

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

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY is not set. Email would have been sent: ', subject);
      return NextResponse.json({ success: true, warning: 'API key missing, mock success' });
    }

    const recipients = Array.from(new Set([toEmail, 'nutracia3@gmail.com'].filter(Boolean)));

    const emailPayload: any = {
      from: 'access-control <onboarding@resend.dev>',
      to: recipients,
      subject,
      html: htmlContent,
    };

    if (pdfBase64) {
      emailPayload.attachments = [
        {
          filename: `${toName.replace(/\s+/g, '_')}_Certificate.pdf`,
          content: pdfBase64,
        }
      ];
    }

    let { data, error } = await resend.emails.send(emailPayload);

    if (error && ((error as any).message?.includes('can only send to') || (error as any).name === 'validation_error')) {
      emailPayload.to = ['nutracia3@gmail.com'];
      const retry = await resend.emails.send(emailPayload);
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
