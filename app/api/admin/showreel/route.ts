export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { uploadVideo, getVideoDetails, CLOUDINARY_CLOUD_NAME } from '@/lib/cloudinary';
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
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'showreel.json');
}

export async function GET() {
  try {
    const configPath = getConfigFile();
    let currentConfig = { ...DEFAULT_SHOWREEL };

    if (fs.existsSync(configPath)) {
      try {
        const fileContent = fs.readFileSync(configPath, 'utf8');
        currentConfig = JSON.parse(fileContent);
      } catch (e) {
        console.warn('Failed to parse showreel config file:', e);
      }
    }

    // Try fetching live metadata from Cloudinary if publicId exists
    let liveMetadata = null;
    if (currentConfig.publicId) {
      liveMetadata = await getVideoDetails(currentConfig.publicId);
    }

    return NextResponse.json({
      success: true,
      data: currentConfig,
      liveMetadata,
      cloudName: CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: any) {
    console.error('Error reading showreel config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to read showreel config' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const directUrl = (formData.get('url') as string | null)?.trim();
    const title = (formData.get('title') as string | null)?.trim() || 'Custom Showreel Video';

    const configPath = getConfigFile();

    // 1. Direct URL submission
    if (directUrl) {
      const newConfig = {
        videoUrl: directUrl,
        publicId: '',
        title,
        format: directUrl.split('.').pop() || 'mp4',
        updatedAt: new Date().toISOString(),
        isCustom: true,
      };

      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');

      return NextResponse.json({
        success: true,
        message: 'Showreel URL updated successfully',
        data: newConfig,
      });
    }

    // 2. File upload to Cloudinary
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No video file or URL provided' },
        { status: 400 }
      );
    }

    // Check file type
    const validMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'];
    if (!validMimes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload an MP4, WEBM, or MOV video.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique timestamped publicId to avoid stale CDN caching while keeping consistent folder
    const timestamp = Date.now();
    const publicId = `active_showreel_${timestamp}`;

    const uploadResult = await uploadVideo(
      buffer,
      publicId,
      'cipherwebsite/showreel'
    );

    const newConfig = {
      videoUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      title: title || file.name,
      format: uploadResult.format,
      duration: uploadResult.duration,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Showreel video successfully uploaded to Cloudinary',
      data: newConfig,
    });
  } catch (error: any) {
    console.error('Error uploading showreel to Cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const configPath = getConfigFile();
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_SHOWREEL, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Showreel reset to default successfully',
      data: DEFAULT_SHOWREEL,
    });
  } catch (error: any) {
    console.error('Error resetting showreel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset showreel' },
      { status: 500 }
    );
  }
}
