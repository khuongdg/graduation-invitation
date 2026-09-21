/**
 * Normalizes image URLs for UI rendering.
 * Automatically converts Google Drive view/share links into direct viewable image URLs.
 */
export function formatImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/view... or /file/d/FILE_ID
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Pattern 2: drive.google.com/open?id=FILE_ID or drive.google.com/uc?id=FILE_ID or id=FILE_ID
  const driveIdMatch = url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return url;
}
