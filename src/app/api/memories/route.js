import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const defaultMemories = [
  { id: 1, name: "Nhóm bạn thân", caption: "Tình bạn diệu kỳ, luôn rạng rỡ nhé!", imageUrl: "/default_memories/memory_grad_chibi.png" },
  { id: 2, name: "Cả lớp cử nhân", caption: "Tung bay những ước mơ!", imageUrl: "/default_memories/memory_grad_cap.png" },
  { id: 3, name: "Khương & Tấm bằng", caption: "Chúc Khương thành công trên con đường mới!", imageUrl: "/default_memories/memory_grad_solo.png" },
  { id: 4, name: "Thầy cô & Bạn bè", caption: "Kỷ niệm đẹp đẽ thời sinh viên!", imageUrl: "/default_memories/memory_grad_group.png" }
];

const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbx-GSi_AUvfJEw-VPTAnEsAsac12aaX45IPYhA0kSEP_QfT40J7koeRnGb_YsY662NDyw/exec';

// In-memory cache to prevent duplicate upload requests (5 minute window)
const recentMemories = new Map();
const recentImageUrls = new Map();

function isDuplicateMemory(key) {
  const now = Date.now();
  const lastTime = recentMemories.get(key);
  if (lastTime && now - lastTime < 300000) { // 5 minutes threshold
    return true;
  }
  recentMemories.set(key, now);
  
  if (recentMemories.size > 200) {
    for (const [k, time] of recentMemories.entries()) {
      if (now - time > 600000) recentMemories.delete(k);
    }
  }
  return false;
}

function isDuplicateImageUrl(url) {
  const now = Date.now();
  const lastTime = recentImageUrls.get(url);
  if (lastTime && now - lastTime < 600000) { // 10 minutes threshold
    return true;
  }
  recentImageUrls.set(url, now);
  return false;
}

function filterUniqueMemories(memoriesList) {
  if (!Array.isArray(memoriesList)) return [];
  const seenUrls = new Set();
  return memoriesList.filter((m) => {
    const url = m.imageUrl || m.image;
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
    const params = new URLSearchParams({ action: 'getMemories' });
    const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow',
      next: { revalidate: 0 } // Disable fetch cache
    });

    let userMemories = [];
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.memories) {
        userMemories = filterUniqueMemories(data.memories);
      }
    } else {
      console.error('Apps Script getMemories returned error status:', response.status);
    }
    
    // Combine user uploaded memories with default ones to ensure rolls are rich
    const combined = filterUniqueMemories([...userMemories, ...defaultMemories]);
    return NextResponse.json({ success: true, memories: combined });
  } catch (error) {
    console.error('Error fetching memories from Apps Script:', error);
    // Fallback to default memories if offline
    return NextResponse.json({ success: true, memories: filterUniqueMemories(defaultMemories) });
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
    const name = formData.get('name') || 'Người thương';
    const caption = formData.get('caption') || 'Chúc mừng tốt nghiệp!';

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'Chưa có ảnh nào được gửi!' }, { status: 400 });
    }

    const dupKey = `${name.trim().toLowerCase()}_${caption.trim().toLowerCase()}_${files.map(f => f.size).join('_')}`;
    if (isDuplicateMemory(dupKey)) {
      console.log(`[Deduplication] Duplicate memory upload ignored for: ${name}`);
      // Fetch current memories to return
      return GET();
    }

    let lastUpdatedMemories = null;

    for (const file of files) {
      // Convert file to base64 string for uploading to Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      
      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${file.type};base64,${base64Image}`,
        {
          folder: 'graduation_memories',
        }
      );

      const imageUrl = uploadResponse.secure_url;
      
      if (isDuplicateImageUrl(imageUrl)) {
        console.log(`[Deduplication] Duplicate image URL skipped for Apps Script: ${imageUrl}`);
        continue;
      }
      
      // Proxy request to Google Sheets via Apps Script GET (avoids POST-redirect body loss in Node)
      const params = new URLSearchParams({
        action: 'saveMemory',
        name,
        caption,
        image: imageUrl
      });

      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        redirect: 'follow'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.memories) {
          lastUpdatedMemories = filterUniqueMemories(data.memories);
        }
      }
    }

    if (lastUpdatedMemories) {
      const combined = filterUniqueMemories([...lastUpdatedMemories, ...defaultMemories]);
      return NextResponse.json({ success: true, memories: combined });
    } else {
      return NextResponse.json({ success: false, message: 'Đồng bộ lưu trữ đám mây thất bại!' }, { status: 502 });
    }
  } catch (error) {
    console.error('Error uploading memory:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi tải ảnh lên Cloudinary!' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const imageUrl = searchParams.get('imageUrl') || searchParams.get('image');
    if (!id && !imageUrl) {
      return NextResponse.json({ success: false, message: 'Thiếu ID hoặc URL ảnh cần xóa!' }, { status: 400 });
    }

    const params = new URLSearchParams({
      action: 'deleteMemory',
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
          if (data.memories) {
            const combined = filterUniqueMemories([...data.memories, ...defaultMemories]);
            return NextResponse.json({ success: true, memories: combined });
          } else {
            // Re-fetch latest memories list if Apps Script returned success without memories payload
            return await GET();
          }
        }
      } catch (jsonErr) {
        console.error('Apps Script returned non-JSON response:', jsonErr);
      }
    }

    return NextResponse.json({ success: false, message: 'Google Apps Script chưa thực hiện xóa được dòng trên Google Sheets! Vui lòng tạo phiên bản triển khai (New Version) mới trên Apps Script.' }, { status: 500 });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ khi xóa!' }, { status: 500 });
  }
}
