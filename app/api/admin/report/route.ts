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

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // 1. Fetch Event Details
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select('title, description, created_at')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Fetch Registrations
    const { data: regData, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('name, prn_number, division, email')
      .eq('event_id', eventId);

    const registrations = regData || [];
    const numRegistrations = registrations.length;

    // 3. Fetch Feedbacks
    const { data: feedbackData, error: feedbackError } = await supabaseAdmin
      .from('feedbacks')
      .select('rating, comment')
      .eq('event_id', eventId);

    const feedbacks = feedbackData || [];
    const numFeedbacks = feedbacks.length;
    const avgRating = numFeedbacks > 0
      ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / numFeedbacks
      : 0;

    // 4. Construct Prompt
    const prompt = `
You are an expert event manager for a university club. Write a short, professional summary report for the following event. The report should be around 2-3 paragraphs.

Event Title: ${eventData.title}
Event Date: ${eventData.created_at}
Description: ${eventData.description}

Total Registrations: ${numRegistrations}
Total Feedbacks Received: ${numFeedbacks}
Average Feedback Rating: ${avgRating.toFixed(1)} / 5

Feedback Comments Sample:
${feedbacks.map(f => `- ${f.comment}`).filter(c => c !== '- ' && c !== '-').slice(0, 5).join('\n')}

Based on the above data, write a brief, professional summary report assessing the event's success, highlighting the attendance, and summarizing the student feedback.
`;

    // 5. Call Groq API
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API Key not found in environment variables.' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return NextResponse.json({ error: 'Failed to generate report from AI.' }, { status: 500 });
    }

    const aiData = await response.json();
    const reportContent = aiData.choices[0].message.content;

    return NextResponse.json({
      success: true,
      report: reportContent,
      stats: {
        title: eventData.title,
        registrations: numRegistrations,
        feedbacks: numFeedbacks,
        avgRating: avgRating.toFixed(1)
      }
    });

  } catch (err: any) {
    console.error('Report Generation Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
