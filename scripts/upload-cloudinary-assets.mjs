#!/usr/bin/env node
/**
 * Upload all transition videos, background loops, and WebP/AVIF images to Cloudinary.
 *
 * Credentials:
 * Cloud name: ititit3w
 * API key: 918296712442656
 * API secret: F7u2hPFRQ80B7XqTuiOsQ71NWfk
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ititit3w';
const API_KEY = process.env.CLOUDINARY_API_KEY || '918296712442656';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'F7u2hPFRQ80B7XqTuiOsQ71NWfk';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const videosDir = path.join(projectRoot, 'public', 'videos');
const optimizedDir = path.join(projectRoot, 'public', 'optimized');
const publicDir = path.join(projectRoot, 'public');

const manifest = {
  videos: {},
  optimizedImages: {},
  rootImages: {},
  uploadedAt: new Date().toISOString(),
};

async function uploadVideoFile(filePath) {
  const filename = path.basename(filePath);
  const nameWithoutExt = path.parse(filename).name;
  const stat = fs.statSync(filePath);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

  console.log(`[VIDEO] Uploading ${filename} (${sizeMB} MB)...`);
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: 'video',
        folder: 'cipherwebsite/videos',
        public_id: nameWithoutExt,
        overwrite: true,
        chunk_size: 6000000, // 6MB chunks
      },
      (error, result) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        if (error) {
          console.error(`  ❌ Failed ${filename}:`, error.message);
          reject(error);
        } else {
          console.log(`  ✅ Done in ${elapsed}s -> ${result.secure_url}`);
          manifest.videos[`/videos/${filename}`] = {
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
            bytes: result.bytes,
          };
          resolve(result);
        }
      }
    );
  });
}

async function uploadImageFile(filePath, subfolder, manifestTarget) {
  const filename = path.basename(filePath);
  const nameWithoutExt = path.parse(filename).name;
  const relPath = path.relative(publicDir, filePath).replace(/\\/g, '/');

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: 'image',
        folder: subfolder,
        public_id: nameWithoutExt,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error(`  ❌ Failed image ${filename}:`, error.message);
          reject(error);
        } else {
          manifestTarget[`/${relPath}`] = {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          };
          resolve(result);
        }
      }
    );
  });
}

async function main() {
  console.log('==================================================');
  console.log(`🚀 Starting Cloudinary Upload to cloud: "${CLOUD_NAME}"`);
  console.log('==================================================\n');

  // Verify Cloudinary ping
  const ping = await cloudinary.api.ping();
  if (ping.status !== 'ok') {
    throw new Error('Cloudinary ping failed: ' + JSON.stringify(ping));
  }
  console.log('✅ Cloudinary connection authenticated successfully!\n');

  // 1. Upload All Videos in public/videos/
  if (fs.existsSync(videosDir)) {
    const videoFiles = fs
      .readdirSync(videosDir)
      .filter((f) => /\.(mp4|webm|mov)$/i.test(f))
      .sort();

    console.log(`Found ${videoFiles.length} videos to upload in /public/videos/...\n`);

    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      console.log(`[${i + 1}/${videoFiles.length}] Processing ${file}...`);
      await uploadVideoFile(path.join(videosDir, file));
    }
  }

  // 2. Upload WebP and AVIF in public/optimized/
  if (fs.existsSync(optimizedDir)) {
    const optFiles = fs
      .readdirSync(optimizedDir)
      .filter((f) => /\.(webp|avif|png|jpg)$/i.test(f))
      .sort();

    console.log(`\nFound ${optFiles.length} optimized images in /public/optimized/...\n`);

    for (let i = 0; i < optFiles.length; i++) {
      const file = optFiles[i];
      process.stdout.write(`[${i + 1}/${optFiles.length}] Uploading optimized/${file}... `);
      await uploadImageFile(
        path.join(optimizedDir, file),
        'cipherwebsite/optimized',
        manifest.optimizedImages
      );
      console.log('✅');
    }
  }

  // 3. Upload key root images (loading-bg, noise, Cases_png, Showreel_png)
  const rootImages = [
    'loading-bg.avif',
    'loading-bg.webp',
    'loading-bg.jpg',
    'noise.webp',
    'Cases_png_transparent.png',
    'Showreel_png_transparent.png',
    'cases-bg.png',
    'events-video-frame.jpg',
  ];

  console.log(`\nUploading ${rootImages.length} core root images...\n`);
  for (const img of rootImages) {
    const imgPath = path.join(publicDir, img);
    if (fs.existsSync(imgPath)) {
      process.stdout.write(`Uploading core image ${img}... `);
      await uploadImageFile(imgPath, 'cipherwebsite/images', manifest.rootImages);
      console.log('✅');
    }
  }

  // 4. Save manifest files
  const dataDir = path.join(projectRoot, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const manifestPath = path.join(dataDir, 'cloudinary-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  const publicManifestPath = path.join(publicDir, 'cloudinary-manifest.json');
  fs.writeFileSync(publicManifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n==================================================');
  console.log(`🎉 Cloudinary upload complete! Manifest saved to:`);
  console.log(`- ${manifestPath}`);
  console.log(`- ${publicManifestPath}`);
  console.log(`Total videos uploaded: ${Object.keys(manifest.videos).length}`);
  console.log(`Total optimized images: ${Object.keys(manifest.optimizedImages).length}`);
  console.log(`Total core images: ${Object.keys(manifest.rootImages).length}`);
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal upload error:', err);
  process.exit(1);
});
