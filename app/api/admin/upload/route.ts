export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;

    let publicUrl = '';

    // 1. Try uploading to Supabase Storage bucket 'event-images'
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('event-images')
        .upload(safeName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });

      if (!error && data) {
        const { data: pubData } = supabaseAdmin.storage
          .from('event-images')
          .getPublicUrl(safeName);
        publicUrl = pubData.publicUrl;
      } else if (error) {
        console.warn('Supabase storage upload notice:', error.message);
      }
    } catch (sErr: any) {
      console.warn('Supabase storage upload exception:', sErr?.message);
    }

    // 2. Save locally to public/uploads/ as additional fallback
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, safeName), buffer);
      if (!publicUrl) {
        publicUrl = `/uploads/${safeName}`;
      }
    } catch (lErr: any) {
      console.warn('Local file write notice:', lErr?.message);
    }

    // 3. Last fallback: Data URL
    if (!publicUrl) {
      publicUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    }

    return NextResponse.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err: any) {
    console.error('Error in upload API:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
