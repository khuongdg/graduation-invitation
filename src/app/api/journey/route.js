import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { formatImageUrl } from '@/utils/image';

// Configure Cloudinary using environment variables with fallbacks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || 'dkll8ms0n',
  api_key: process.env.CLOUDINARY_API_KEY || '717479395482553',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'XzibdHMYDNJA1f4jqlC8y9js0ys',
});

const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbx-GSi_AUvfJEw-VPTAnEsAsac12aaX45IPYhA0kSEP_QfT40J7koeRnGb_YsY662NDyw/exec';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchJourneyPhotosFromSheet() {
  try {
    const params = new URLSearchParams({ action: 'getJourney', t: Date.now().toString() });
    const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      redirect: 'follow',
      next: { revalidate: 0 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.journeyPhotos)) {
        // Reverse so newest uploaded photos from Google Sheets appear first!
        const photos = [...data.journeyPhotos].reverse().map((m) => ({
          id: m.id || Date.now(),
          title: m.title || m.name || '',
          caption: m.caption || '',
          imageUrl: formatImageUrl(m.imageUrl || m.image),
          isFeatured: m.isFeatured === true || m.isFeatured === 'true'
        }));
        return photos;
      }
    }
  } catch (e) {
    console.error('Apps Script fetchJourneyPhotosFromSheet error:', e);
  }
  return [];
}

export async function GET() {
  try {
    const photos = await fetchJourneyPhotosFromSheet();

    // Enforce max 5 featured photos cap
    let featCounter = 0;
    const finalPhotos = photos.map((p) => {
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

    return NextResponse.json(
      { success: true, photos: finalPhotos },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
  } catch (error) {
    console.error('Error in /api/journey GET:', error);
    return NextResponse.json({ success: true, photos: [] });
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

    const currentPhotos = await fetchJourneyPhotosFromSheet();
    let featuredCount = currentPhotos.filter((p) => p.isFeatured).length;
    let uploadCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let imageUrl = '';

      if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';

        try {
          const uploadResponse = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${base64Image}`,
            { folder: 'journey_photos' }
          );
          if (uploadResponse && uploadResponse.secure_url) {
            imageUrl = uploadResponse.secure_url;
          }
        } catch (cloudErr) {
          console.error('Cloudinary upload error in /api/journey:', cloudErr);
        }
      } else if (typeof formData.get('imageUrl') === 'string') {
        imageUrl = formData.get('imageUrl');
      }

      if (imageUrl) {
        const autoFeature = featuredCount < 5;
        if (autoFeature) featuredCount++;

        const photoId = Date.now() + i;
        const photoTitle = files.length > 1 && title ? `${title} (${i + 1})` : title;

        try {
          const params = new URLSearchParams({
            action: 'saveJourney',
            id: photoId.toString(),
            title: photoTitle,
            caption: caption,
            image: imageUrl,
            isFeatured: autoFeature ? 'true' : 'false'
          });
          await fetch(`${googleScriptUrl}?${params.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            redirect: 'follow',
            next: { revalidate: 0 }
          });
          uploadCount++;
        } catch (scriptErr) {
          console.warn('Apps Script saveJourney warning:', scriptErr);
        }
      }
    }

    if (uploadCount === 0) {
      return NextResponse.json({ success: false, message: 'Tải ảnh lên thất bại!' }, { status: 400 });
    }

    const updatedPhotos = await fetchJourneyPhotosFromSheet();

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
      message: `✨ Đã thêm ${uploadCount} ảnh vào Section 2 thành công!`
    });
  } catch (error) {
    console.error('Error in /api/journey POST:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tải ảnh!' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, isFeatured, imageUrl } = await request.json();
    if (!id && !imageUrl) {
      return NextResponse.json({ success: false, message: 'Thiếu ID hoặc URL ảnh' }, { status: 400 });
    }

    try {
      const params = new URLSearchParams({
        action: 'toggleStarJourney',
        id: id ? id.toString() : '',
        image: imageUrl || '',
        isFeatured: isFeatured ? 'true' : 'false'
      });
      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        next: { revalidate: 0 }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.journeyPhotos)) {
          const photos = [...data.journeyPhotos].reverse().map((m) => ({
            id: m.id || Date.now(),
            title: m.title || m.name || '',
            caption: m.caption || '',
            imageUrl: formatImageUrl(m.imageUrl || m.image),
            isFeatured: m.isFeatured === true || m.isFeatured === 'true'
          }));
          return NextResponse.json({ success: true, photos, message: 'Đã cập nhật trạng thái ảnh!' });
        }
      }
    } catch (e) {
      console.warn('Apps Script toggleStarJourney warning:', e);
    }

    const updatedPhotos = await fetchJourneyPhotosFromSheet();
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
    const imageUrl = searchParams.get('imageUrl') || searchParams.get('image');
    if (!id && !imageUrl) {
      return NextResponse.json({ success: false, message: 'Thiếu ID hoặc URL ảnh cần xóa' }, { status: 400 });
    }

    try {
      const params = new URLSearchParams({
        action: 'deleteJourney',
        id: id ? id.toString() : '',
        image: imageUrl || ''
      });
      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        next: { revalidate: 0 }
      });
      if (response.ok) {
        try {
          const data = await response.json();
          if (data.success) {
            if (Array.isArray(data.journeyPhotos)) {
              const photos = [...data.journeyPhotos].reverse().map((m) => ({
                id: m.id || Date.now(),
                title: m.title || m.name || '',
                caption: m.caption || '',
                imageUrl: formatImageUrl(m.imageUrl || m.image),
                isFeatured: m.isFeatured === true || m.isFeatured === 'true'
              }));
              return NextResponse.json({ success: true, photos, message: 'Đã xóa ảnh thành công!' });
            }
          }
        } catch (jsonErr) {
          console.warn('Apps Script deleteJourney response parse error:', jsonErr);
        }
      }
    } catch (e) {
      console.warn('Apps Script deleteJourney warning:', e);
    }

    const updatedPhotos = await fetchJourneyPhotosFromSheet();
    return NextResponse.json({ success: true, photos: updatedPhotos, message: 'Đã xóa ảnh thành công!' });
  } catch (error) {
    console.error('Error in /api/journey DELETE:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa ảnh' }, { status: 500 });
  }
}


