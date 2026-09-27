export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  try {
    const { eventId, eventTitle, studentName, studentEmail } = await request.json();

    const queryTerm = (studentName || '').trim();
    const emailTerm = (studentEmail || '').trim();

    if (!queryTerm || !emailTerm) {
      return NextResponse.json({ verified: false, message: 'Please enter both your name/PRN and registered email.' }, { status: 400 });
    }

    // 1. Fetch matching student profiles
    const { data: students, error: sErr } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('email', emailTerm.toLowerCase())
      .or(`name.ilike.%${queryTerm}%,prn_number.ilike.%${queryTerm}%`);

    if (sErr || !students || students.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'No participant record found with this name or PRN. Please make sure you registered for the event with this name.'
      });
    }

    const studentIds = students.map(s => s.id);

    // 2. Resolve target event ID if not provided
    let targetEventId = eventId;
    if (!targetEventId && eventTitle) {
      const { data: evts } = await supabaseAdmin
        .from('events')
        .select('id')
        .ilike('title', `%${eventTitle}%`)
        .limit(1);
      if (evts && evts.length > 0) {
        targetEventId = evts[0].id;
      }
    }

    // 3. Query event_registrations table
    let regQuery = supabaseAdmin
      .from('event_registrations')
      .select('*, student_profiles(*)')
      .in('student_id', studentIds);

    if (targetEventId) {
      regQuery = regQuery.eq('event_id', targetEventId);
    }

    const { data: regs, error: rErr } = await regQuery;

    if (rErr || !regs || regs.length === 0) {
      return NextResponse.json({
        verified: false,
        message: 'Registration record not found for this event. You must be a registered participant to claim a certificate.'
      });
    }

    const approvedReg = regs.find(r => r.approved === true && r.attended === true);
    if (!approvedReg) {
      return NextResponse.json({
        verified: false,
        message: 'Access Denied: Your registration must be approved AND you must be marked as present by an administrator to claim a certificate.'
      });
    }

    const matchedStudent = approvedReg.student_profiles || students[0];

    return NextResponse.json({
      verified: true,
      studentName: matchedStudent.name || queryTerm,
      studentEmail: matchedStudent.email || emailTerm,
      regId: approvedReg.id,
      message: 'Participant verified and approved!'
    });
  } catch (err: any) {
    console.error('Error verifying certificate:', err);
    return NextResponse.json({ verified: false, message: 'Verification error. Please try again.' }, { status: 500 });
  }
}
