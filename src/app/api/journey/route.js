import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { formatImageUrl } from '@/utils/image';

// Configure Cloudinary using environment variables with fallbacks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || 'dkll8ms0n',
  api_key: process.env.CLOUDINARY_API_KEY || '717479395482553',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'XzibdHMYDNJA1f4jqlC8y9js0ys',
});

const defaultJourneyPhotos = [];

const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbx-GSi_AUvfJEw-VPTAnEsAsac12aaX45IPYhA0kSEP_QfT40J7koeRnGb_YsY662NDyw/exec';

const getFilePath = () => path.join(process.cwd(), 'public', 'journey_photos.json');

let inMemoryJourneyPhotos = null;

function readLocalJourneyPhotos() {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading journey_photos.json:', err);
  }
  return [];
}

function saveLocalJourneyPhotos(photos) {
  inMemoryJourneyPhotos = photos;
  try {
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(photos, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write to journey_photos.json (read-only filesystem):', err);
  }
}

function filterUniquePhotos(photosList) {
  if (!Array.isArray(photosList)) return [];
  const seenUrls = new Set();
  return photosList.filter((p) => {
    const url = formatImageUrl(p.imageUrl || p.image);
    if (!url) return true;
    if (seenUrls.has(url)) return false;
    seenUrls.add(url);
    return true;
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const localPhotos = readLocalJourneyPhotos();
    let cloudPhotos = [];

    // Attempt to fetch synced photos from dedicated 'Hành trình' sheet tab via Google Apps Script
    try {
      const params = new URLSearchParams({ action: 'getJourney' });
      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        next: { revalidate: 0 }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.journeyPhotos) && data.journeyPhotos.length > 0) {
          // Reverse so newest uploaded photos from Google Sheets appear first!
          cloudPhotos = [...data.journeyPhotos].reverse().map((m) => ({
            id: m.id || Date.now(),
            title: m.title || m.name || '',
            caption: m.caption || '',
            imageUrl: formatImageUrl(m.imageUrl || m.image),
            isFeatured: m.isFeatured === true || m.isFeatured === 'true'
          }));
        }
      }
    } catch (e) {
      console.warn('Apps Script GET getJourney warning:', e);
    }

    let finalPhotos = [];

    if (cloudPhotos.length > 0) {
      // Create Map keyed by ID so Cloud photos from Google Sheets take precedence
      const photoMap = new Map();
      cloudPhotos.forEach((p) => {
        photoMap.set(String(p.id), p);
      });

      // Supplement with local photos if not already present
      localPhotos.forEach((p) => {
        const key = String(p.id);
        if (!photoMap.has(key)) {
          photoMap.set(key, { ...p, imageUrl: formatImageUrl(p.imageUrl) });
        }
      });

      finalPhotos = Array.from(photoMap.values());
    } else {
      finalPhotos = filterUniquePhotos([
        ...(inMemoryJourneyPhotos || []),
        ...localPhotos
      ]).map((p) => ({ ...p, imageUrl: formatImageUrl(p.imageUrl) }));
    }

    // Enforce max 5 featured photos cap
    let featCounter = 0;
    finalPhotos = finalPhotos.map((p) => {
      if (p.isFeatured) {
        if (featCounter < 5) {
          featCounter++;
          return { ...p, isFeatured: true };
        } else {
          return { ...p, isFeatured: false };
        }
      }
      return { ...p, isFeatured: false };
    });

    // Keep memory cache updated with newest sheet data
    inMemoryJourneyPhotos = finalPhotos;

    return NextResponse.json(
      { success: true, photos: finalPhotos },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('Error in /api/journey GET:', error);
    return NextResponse.json({ success: true, photos: filterUniquePhotos([...readLocalJourneyPhotos(), ...defaultJourneyPhotos]).map(p => ({ ...p, imageUrl: formatImageUrl(p.imageUrl) })) });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    let files = formData.getAll('images');
    if (!files || files.length === 0) {
      const singleFile = formData.get('image');
      if (singleFile) files = [singleFile];
    }
    const rawTitle = formData.get('title');
    const rawCaption = formData.get('caption');
    const title = rawTitle !== null && rawTitle !== undefined ? rawTitle.trim() : '';
    const caption = rawCaption !== null && rawCaption !== undefined ? rawCaption.trim() : '';

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'Chưa có ảnh nào được chọn!' }, { status: 400 });
    }

    const currentPhotos = readLocalJourneyPhotos();
    const newPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let imageUrl = '';

      if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        // 1. Upload to Cloudinary (folder journey_photos)
        try {
          const uploadResponse = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${base64Image}`,
            { folder: 'journey_photos' }
          );
          if (uploadResponse && uploadResponse.secure_url) {
            imageUrl = uploadResponse.secure_url;
          }
        } catch (cloudErr) {
          console.warn('Cloudinary upload warning in /api/journey (falling back to local/base64):', cloudErr);
        }

        // Fallback to local save or base64 if Cloudinary was unreachable
        if (!imageUrl) {
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'journey_uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const safeName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `journey_${Date.now()}_${i}_${safeName}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imageUrl = `/journey_uploads/${fileName}`;
          } catch (localErr) {
            imageUrl = `data:${mimeType};base64,${base64Image}`;
          }
        }
      } else if (typeof formData.get('imageUrl') === 'string') {
        imageUrl = formData.get('imageUrl');
      }

      if (imageUrl) {
        // Only set as featured if total featured count is under 5
        const currentlyFeaturedCount = currentPhotos.filter((p) => p.isFeatured).length + newPhotos.filter((p) => p.isFeatured).length;
        const autoFeature = currentlyFeaturedCount < 5;

        const photoObj = {
          id: Date.now() + i,
          title: files.length > 1 && title ? `${title} (${i + 1})` : title,
          caption,
          imageUrl,
          isFeatured: autoFeature
        };

        newPhotos.push(photoObj);

        // 2. Sync to dedicated 'Hành trình' tab in Google Sheets via Apps Script
        try {
          const params = new URLSearchParams({
            action: 'saveJourney',
            id: photoObj.id.toString(),
            title: photoObj.title,
            caption: photoObj.caption,
            image: imageUrl,
            isFeatured: autoFeature ? 'true' : 'false'
          });
          await fetch(`${googleScriptUrl}?${params.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            redirect: 'follow'
          });
        } catch (scriptErr) {
          console.warn('Apps Script saveJourney warning:', scriptErr);
        }
      }
    }

    if (newPhotos.length === 0) {
      return NextResponse.json({ success: false, message: 'Tải ảnh lên thất bại!' }, { status: 400 });
    }

    // Balance featured status so max featured count is strictly 5
    let featCounter = 0;
    const updatedPhotos = filterUniquePhotos([...currentPhotos, ...newPhotos]).map((p) => {
      if (p.isFeatured) {
        if (featCounter < 5) {
          featCounter++;
          return { ...p, isFeatured: true };
        } else {
          return { ...p, isFeatured: false };
        }
      }
      return { ...p, isFeatured: false };
    });

    saveLocalJourneyPhotos(updatedPhotos);

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
      message: `✨ Đã thêm ${newPhotos.length} ảnh vào Section 2 thành công!`
    });
  } catch (error) {
    console.error('Error in /api/journey POST:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tải ảnh!' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, isFeatured } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID ảnh' }, { status: 400 });
    }

    const currentPhotos = readLocalJourneyPhotos();

    if (isFeatured) {
      const currentlyFeaturedCount = currentPhotos.filter(p => p.isFeatured && String(p.id) !== String(id)).length;
      if (currentlyFeaturedCount >= 5) {
        return NextResponse.json({
          success: false,
          message: 'Bạn chỉ được chọn tối đa 5 ảnh đại diện hiển thị ngoài Section 2!'
        }, { status: 400 });
      }
    }

    const updatedPhotos = currentPhotos.map(p => {
      if (String(p.id) === String(id)) {
        return { ...p, isFeatured: Boolean(isFeatured) };
      }
      return p;
    });

    // Sync toggle star status to Google Sheets 'Hành trình' tab
    try {
      const params = new URLSearchParams({
        action: 'toggleStarJourney',
        id: id.toString(),
        isFeatured: isFeatured ? 'true' : 'false'
      });
      await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });
    } catch (e) {
      console.warn('Apps Script toggleStarJourney warning:', e);
    }

    saveLocalJourneyPhotos(updatedPhotos);
    return NextResponse.json({ success: true, photos: updatedPhotos, message: 'Đã cập nhật trạng thái ảnh!' });
  } catch (error) {
    console.error('Error in /api/journey PATCH:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi cập nhật' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID ảnh' }, { status: 400 });
    }

    const currentPhotos = readLocalJourneyPhotos();
    const targetPhoto = currentPhotos.find((p) => String(p.id) === String(id));

    if (targetPhoto && targetPhoto.imageUrl) {
      if (targetPhoto.imageUrl.startsWith('/journey_uploads/')) {
        try {
          const localPath = path.join(process.cwd(), 'public', targetPhoto.imageUrl);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        } catch (e) {
          console.warn('Could not delete local file:', e);
        }
      }

      // Sync deletion with Google Sheets 'Hành trình' tab
      try {
        const params = new URLSearchParams({
          action: 'deleteJourney',
          id: id.toString(),
          image: targetPhoto.imageUrl
        });
        await fetch(`${googleScriptUrl}?${params.toString()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          redirect: 'follow'
        });
      } catch (e) {
        console.warn('Apps Script deleteJourney warning:', e);
      }
    }

    const updatedPhotos = currentPhotos.filter((p) => String(p.id) !== String(id));
    saveLocalJourneyPhotos(updatedPhotos);

    return NextResponse.json({ success: true, photos: updatedPhotos, message: 'Đã xóa ảnh thành công!' });
  } catch (error) {
    console.error('Error in /api/journey DELETE:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa ảnh' }, { status: 500 });
  }
}

