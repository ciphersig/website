import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  'ititit3w';

export const CLOUDINARY_API_KEY =
  process.env.CLOUDINARY_API_KEY || '918296712442656';

export const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || 'F7u2hPFRQ80B7XqTuiOsQ71NWfk';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a video buffer or file stream to Cloudinary with chunked upload support
 */
export async function uploadVideo(
  fileBuffer: Buffer,
  publicId = 'active_showreel',
  folder = 'cipherwebsite/showreel'
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        public_id: publicId,
        overwrite: true,
        chunk_size: 6000000, // 6MB chunk size for reliable streaming upload
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload returned empty response'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Get Cloudinary video details by public_id
 */
export async function getVideoDetails(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    });
    return result;
  } catch (err) {
    return null;
  }
}
