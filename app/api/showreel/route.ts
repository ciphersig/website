export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DEFAULT_SHOWREEL = {
  videoUrl: 'https://res.cloudinary.com/ititit3w/video/upload/v1790450859/cipherwebsite/videos/loading_showreel.mp4',
  publicId: 'cipherwebsite/videos/loading_showreel',
  title: 'Default Cyber Showreel',
  format: 'mp4',
  updatedAt: new Date().toISOString(),
  isCustom: false,
};

function getConfigFile(): string {
  return path.join(process.cwd(), 'data', 'showreel.json');
}

export async function GET() {
  try {
    const configPath = getConfigFile();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed?.videoUrl) {
        return NextResponse.json({
          success: true,
          ...parsed,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...DEFAULT_SHOWREEL,
    });
  } catch (error: any) {
    console.error('Error fetching showreel config:', error);
    return NextResponse.json({
      success: true,
      ...DEFAULT_SHOWREEL,
      error: error.message,
    });
  }
}
