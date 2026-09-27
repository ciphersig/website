import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { sendRegistrationPendingEmail } from '@/app/utils/emailService';

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
    const { name, email, prn_number, roll_no, class_name, eventId, eventTitle } = await request.json();

    if (!name || !email || !prn_number || !roll_no || !class_name || !eventId) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 1. Check if profile already exists by email
    const { data: existingProfiles, error: searchError } = await supabaseAdmin
      .from('student_profiles')
      .select('id')
      .eq('email', email.toLowerCase());

    if (searchError) throw searchError;

    let studentId = '';

    if (existingProfiles && existingProfiles.length > 0) {
      studentId = existingProfiles[0].id;
      // Optionally update profile details
      await supabaseAdmin.from('student_profiles').update({
        name, prn_number, roll_no, class_name
      }).eq('id', studentId);
    } else {
      // Create new profile
      studentId = uuidv4();
      const { error: insertError } = await supabaseAdmin.from('student_profiles').insert({
        id: studentId,
        email: email.toLowerCase(),
        name,
        prn_number,
        roll_no,
        class_name,
        branch: 'N/A' // Fallback
      });
      if (insertError) throw insertError;
    }

    // 2. Check if already registered for this event
    const { data: existingReg, error: regSearchError } = await supabaseAdmin
      .from('event_registrations')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', eventId);
      
    if (regSearchError) throw regSearchError;
    
    if (existingReg && existingReg.length > 0) {
      return NextResponse.json({ error: 'You are already registered for this event.' }, { status: 400 });
    }

    // 3. Create registration
    const { data: reg, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: studentId,
        approved: false,
        attended: false
      })
      .select('id')
      .single();

    if (regError) throw regError;

    // 4. Fetch Event Title if not provided
    let finalEventName = eventTitle;
    if (!finalEventName) {
      const { data: eventData } = await supabaseAdmin
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();
      finalEventName = eventData?.title || 'Cyber Operation Event';
    }

    // 5. Automatically send Pending Registration Confirmation Email
    try {
      await sendRegistrationPendingEmail({
        userName: name,
        userEmail: email,
        prnNumber: prn_number,
        rollNo: roll_no,
        className: class_name,
        eventName: finalEventName,
        regId: reg.id,
      });
    } catch (emailErr) {
      console.error('Failed to send pending registration email:', emailErr);
      // Non-blocking for registration success
    }

    return NextResponse.json({ success: true, regId: reg.id });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
