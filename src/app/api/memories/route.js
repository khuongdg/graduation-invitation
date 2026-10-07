import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { formatImageUrl } from '@/utils/image';
import { siteConfig } from '@/config/siteConfig';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const defaultMemories = siteConfig.defaultMemories;
const googleScriptUrl = siteConfig.googleScriptUrl;

// In-memory cache to prevent duplicate upload requests & store text-only memories
const recentMemories = new Map();
const recentImageUrls = new Map();
const localTextMemories = [];

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
  const seenTextKeys = new Set();
  return memoriesList.filter((m) => {
    if (!m) return false;
    const url = formatImageUrl(m.imageUrl || m.image);
    if (url) {
      if (seenUrls.has(url)) return false;
      seenUrls.add(url);
      return true;
    }
    const nameStr = (m.name || m.title || '').toString().trim().toLowerCase();
    const captionStr = (m.caption || '').toString().trim().toLowerCase();
    if (!nameStr && !captionStr) return false;

    const key = m.id ? `id_${m.id}` : `text_${nameStr}_${captionStr}`;
    if (seenTextKeys.has(key)) return false;
    seenTextKeys.add(key);
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
        userMemories = data.memories.map((m) => ({
          ...m,
          imageUrl: formatImageUrl(m.imageUrl || m.image),
          time: m.time || m.timestamp || m.date || m.createdAt || m.created_at || ''
        }));
      }
    } else {
      console.error('Apps Script getMemories returned error status:', response.status);
    }

    // Combine user uploaded memories, in-memory text memories, and default ones
    const formattedDefaults = defaultMemories.map((m) => ({ ...m, imageUrl: formatImageUrl(m.imageUrl) }));
    const combined = filterUniqueMemories([...userMemories, ...localTextMemories, ...formattedDefaults]);
    return NextResponse.json(
      { success: true, memories: combined },
      { headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching memories from Apps Script:', error);
    // Fallback to default memories if offline
    return NextResponse.json(
      { success: true, memories: filterUniqueMemories([...localTextMemories, ...defaultMemories]) },
      { headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300' } }
    );
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
    const name = (formData.get('name') || '').toString();
    const caption = (formData.get('caption') || '').toString();

    let currentTimestamp = '';
    try {
      currentTimestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    } catch (e) {
      currentTimestamp = new Date().toLocaleString();
    }

    // Handle text-only wishes (no image uploaded)
    const validFiles = files.filter(f => f && typeof f !== 'string' && f.size > 0);
    if (validFiles.length === 0) {
      const textMemory = {
        id: `text_${Date.now()}`,
        name,
        caption,
        imageUrl: '',
        image: '',
        timestamp: currentTimestamp,
        time: currentTimestamp
      };
      localTextMemories.unshift(textMemory);

      const params = new URLSearchParams({
        action: 'saveMemory',
        name,
        caption,
        image: '',
        time: currentTimestamp,
        timestamp: currentTimestamp
      });

      // Background non-blocking sync for text-only wishes (instant <50ms response)
      fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      }).catch((errScript) => {
        console.error('Apps Script saveMemory call warning:', errScript);
      });

      const combined = filterUniqueMemories([textMemory, ...localTextMemories, ...defaultMemories]);
      return NextResponse.json({ success: true, memories: combined });
    }

    files = validFiles;

    const dupKey = `${name.trim().toLowerCase()}_${caption.trim().toLowerCase()}_${files.map(f => f.size).join('_')}`;
    if (isDuplicateMemory(dupKey)) {
      console.log(`[Deduplication] Duplicate memory upload ignored for: ${name}`);
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

      let currentTimestamp = '';
      try {
        currentTimestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      } catch (e) {
        currentTimestamp = new Date().toLocaleString();
      }

      // Proxy request to Google Sheets via Apps Script GET (avoids POST-redirect body loss in Node)
      const params = new URLSearchParams({
        action: 'saveMemory',
        name,
        caption,
        image: imageUrl,
        time: currentTimestamp,
        timestamp: currentTimestamp
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
