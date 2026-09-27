import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Here you would integrate your custom API or Resend API.
    // Example:
    // await fetch('https://your-api.com/send', { method: 'POST', body: JSON.stringify(data) });
    
    console.log('Contact form received:', data);
    
    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request.' }, { status: 500 });
  }
}
