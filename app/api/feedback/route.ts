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
    const { name, prn_number, class_name, rating, comment, eventId } = await request.json();

    if (!name || !prn_number || !class_name || !rating || !eventId) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin.from('feedbacks').insert({
      event_id: eventId,
      name,
      prn_number,
      class_name,
      rating,
      comment: comment || '',
    });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Feedback API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
