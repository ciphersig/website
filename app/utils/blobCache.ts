/**
 * In-Memory Blob URL Cache for Zero-Latency Video & Image Playback
 */

const blobCache = new Map<string, string>();
const fetchPromises = new Map<string, Promise<string>>();

/**
 * Pre-fetches an asset (video/image) and converts it to a Blob URL
 */
export async function preloadAsBlobUrl(url: string): Promise<string> {
  if (!url) return '';

  if (blobCache.has(url)) {
    return blobCache.get(url)!;
  }

  if (fetchPromises.has(url)) {
    return fetchPromises.get(url)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobCache.set(url, blobUrl);
      return blobUrl;
    } catch (err) {
      console.warn(`[BlobCache] Failed to blob-cache ${url}, using direct URL fallback:`, err);
      return url;
    } finally {
      fetchPromises.delete(url);
    }
  })();

  fetchPromises.set(url, promise);
  return promise;
}

/**
 * Synchronously retrieve the cached Blob URL for an asset, or fall back to the raw URL
 */
export function getBlobUrl(url: string): string {
  if (!url) return '';
  return blobCache.get(url) || url;
}
