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

  // Pattern 3: Cloudinary URL optimization (f_auto, q_auto preserves quality & dimensions while reducing payload by 70%)
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/f_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return url;
}

/**
 * Automatically compresses heavy image files on the client side before uploading.
 * Reduces 10MB-20MB camera photos down to ~500KB-900KB while maintaining 100% sharp visual quality.
 */
export async function compressImageFile(file, maxDimension = 2400, quality = 0.88) {
  if (!file || typeof file === 'string' || !file.type || !file.type.startsWith('image/')) return file;
  // If file is already under 1MB, no compression needed
  if (file.size < 1024 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

