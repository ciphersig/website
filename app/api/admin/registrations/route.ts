import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAccessGrantedEmail } from '@/app/utils/emailService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }

  try {
    // 1. Fetch registrations bypassing RLS
    const { data: regData, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (regError) throw regError;
    
    if (!regData || regData.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const studentIds = Array.from(new Set(regData.map(r => r.student_id)));

    // 2. Fetch profiles bypassing RLS
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('student_profiles')
      .select('id, name, prn_number, roll_no, branch, class_name, email')
      .in('id', studentIds);

    if (profilesError) throw profilesError;

    // Merge data
    const mergedData = regData.map(reg => {
      const profile = profilesData?.find(p => p.id === reg.student_id);
      return {
        ...reg,
        student_profiles: profile || null
      };
    });

    return NextResponse.json({ data: mergedData });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { regId, action, value } = await request.json();

    if (!regId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Action can be 'approve' or 'attendance'
    let updatePayload = {};
    if (action === 'approve') {
      updatePayload = { approved: true };
    } else if (action === 'attendance') {
      updatePayload = { attended: value };
    }

    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .update(updatePayload)
      .eq('id', regId)
      .select('*')
      .single();

    if (error) throw error;

    // Auto-dispatch Access Granted Email upon Admin Approval
    if (action === 'approve') {
      try {
        const { data: regDetail } = await supabaseAdmin
          .from('event_registrations')
          .select('*, student_profiles(*), events(title)')
          .eq('id', regId)
          .single();

        if (regDetail && regDetail.student_profiles) {
          await sendAccessGrantedEmail({
            userName: regDetail.student_profiles.name,
            userEmail: regDetail.student_profiles.email,
            prnNumber: regDetail.student_profiles.prn_number,
            rollNo: regDetail.student_profiles.roll_no,
            className: regDetail.student_profiles.class_name,
            eventName: regDetail.events?.title || 'Cyber Event',
            regId: regId,
          });
        }
      } catch (emailErr) {
        console.error('Failed to dispatch access granted email on approval:', emailErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

