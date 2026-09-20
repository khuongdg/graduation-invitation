import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const defaultJourneyPhotos = [
  { id: 1, title: "Khuôn viên TDTU", imageUrl: "/default_memories/memory_grad_solo.png", caption: "Trường Đại học Tôn Đức Thắng", isFeatured: true },
  { id: 2, title: "Nhóm bạn thân", imageUrl: "/default_memories/memory_grad_chibi.png", caption: "Kỷ niệm ngày chụp ảnh", isFeatured: true },
  { id: 3, title: "Lễ Tốt Nghiệp", imageUrl: "/default_memories/memory_grad_cap.png", caption: "Tung bay những ước mơ", isFeatured: true },
  { id: 4, title: "Thầy cô & Bạn bè", imageUrl: "/default_memories/memory_grad_group.png", caption: "Trân trọng từng khoảnh khắc", isFeatured: true },
  { id: 5, title: "Hành trình mới", imageUrl: "/assets/test.JPG", caption: "Sẵn sàng vươn xa", isFeatured: true }
];

const getFilePath = () => path.join(process.cwd(), 'public', 'journey_photos.json');

let inMemoryJourneyPhotos = null;

function readJourneyPhotos() {
  try {
    const filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileData);
      if (Array.isArray(data) && data.length > 0) {
        inMemoryJourneyPhotos = data;
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading journey_photos.json:', err);
  }
  if (inMemoryJourneyPhotos && Array.isArray(inMemoryJourneyPhotos)) {
    return inMemoryJourneyPhotos;
  }
  return defaultJourneyPhotos;
}

function saveJourneyPhotos(photos) {
  inMemoryJourneyPhotos = photos;
  try {
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(photos, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write to journey_photos.json (read-only filesystem):', err);
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const photos = readJourneyPhotos();
  return NextResponse.json(
    { success: true, photos },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    let files = formData.getAll('images');
    if (!files || files.length === 0) {
      const singleFile = formData.get('image');
      if (singleFile) files = [singleFile];
    }
    const title = formData.get('title') || '';
    const caption = formData.get('caption') || '';

    const currentPhotos = readJourneyPhotos();
    let featuredCount = currentPhotos.filter(p => p.isFeatured).length;
    const newPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let imageUrl = '';

      if (file && typeof file !== 'string') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        let uploaded = false;

        // Tier 1: Try Cloudinary upload
        if (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            const uploadResponse = await cloudinary.uploader.upload(
              `data:${mimeType};base64,${base64Image}`,
              { folder: 'journey_photos' }
            );
            if (uploadResponse && uploadResponse.secure_url) {
              imageUrl = uploadResponse.secure_url;
              uploaded = true;
            }
          } catch (cloudErr) {
            console.warn('Cloudinary upload warning (falling back to local/base64):', cloudErr);
          }
        }

        // Tier 2: Try Local Filesystem save if Cloudinary didn't upload
        if (!uploaded) {
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
            uploaded = true;
          } catch (localErr) {
            console.warn('Local save warning (falling back to Data URI):', localErr);
          }
        }

        // Tier 3: Fallback to Data URI if both Cloudinary & disk writes failed
        if (!uploaded) {
          imageUrl = `data:${mimeType};base64,${base64Image}`;
        }
      } else if (typeof formData.get('imageUrl') === 'string') {
        imageUrl = formData.get('imageUrl');
      }

      if (imageUrl) {
        const isFeatured = featuredCount < 5;
        if (isFeatured) featuredCount++;

        newPhotos.push({
          id: Date.now() + i,
          title: files.length > 1 && title ? `${title} (${i + 1})` : title,
          caption,
          imageUrl,
          isFeatured
        });
      }
    }

    if (newPhotos.length === 0) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn hoặc nhập đường dẫn ảnh!' }, { status: 400 });
    }

    const updatedPhotos = [...newPhotos, ...currentPhotos];
    saveJourneyPhotos(updatedPhotos);

    return NextResponse.json({
      success: true,
      photos: updatedPhotos,
      message: `Thêm ${newPhotos.length} ảnh thành công!`
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

    const currentPhotos = readJourneyPhotos();

    // Check count of featured photos if toggling to true
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

    saveJourneyPhotos(updatedPhotos);
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

    const currentPhotos = readJourneyPhotos();
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
    }

    const updatedPhotos = currentPhotos.filter((p) => String(p.id) !== String(id));
    saveJourneyPhotos(updatedPhotos);

    return NextResponse.json({ success: true, photos: updatedPhotos, message: 'Đã xóa ảnh thành công!' });
  } catch (error) {
    console.error('Error in /api/journey DELETE:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa ảnh' }, { status: 500 });
  }
}
