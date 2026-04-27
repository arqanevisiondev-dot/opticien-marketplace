import sharp from 'sharp';

/**
 * MIME types that will be converted to WebP.
 * - GIF is excluded to preserve potential animations.
 * - WebP is excluded to avoid re-compressing an already-optimised file.
 * - Non-image types (video, PDF, …) are excluded — the route handles those.
 */
const CONVERTIBLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/avif',
  'image/bmp',
  'image/tiff',
]);

interface ConvertResult {
  buffer: Buffer;
  contentType: string;
  /** File extension without leading dot */
  ext: string;
}

/**
 * Converts an image buffer to WebP (quality 82, effort 4).
 * Returns the original buffer unchanged for unsupported / non-image types.
 *
 * This runs once at upload time (admin-only) and produces a permanently
 * smaller file — reducing Vercel Blob storage and bandwidth on every view.
 */
export async function convertToWebp(
  buffer: Buffer,
  mimeType: string,
): Promise<ConvertResult> {
  if (!CONVERTIBLE_IMAGE_TYPES.has(mimeType)) {
    // Derive a safe extension from the MIME type for non-converted files
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';
    return { buffer, contentType: mimeType, ext };
  }

  const webpBuffer = await sharp(buffer)
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  return { buffer: webpBuffer, contentType: 'image/webp', ext: 'webp' };
}
