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
  { id: 4, name: "Thầy cô & Bạn bè", caption: "Kỷ niệm đẹp đẽ thời sinh viên!", imageUrl: "/default_memories/memory_grad_group.png" },
  { id: 5, name: "Minh Anh", caption: "Chúc mừng Khương tốt nghiệp nhé! Siêu xịn!", imageUrl: "/default_memories/memory_grad_chibi.png" },
  { id: 6, name: "Hải Đăng", caption: "Khoảnh khắc tuyệt đẹp. Mãi là bạn tốt!", imageUrl: "/default_memories/memory_grad_cap.png" },
  { id: 7, name: "Ngọc Vy", caption: "Chúc bạn tôi bay cao bay xa!", imageUrl: "/default_memories/memory_grad_solo.png" },
  { id: 8, name: "Quốc Huy", caption: "Chúc mừng ngày đặc biệt của bạn nhé!", imageUrl: "/default_memories/memory_grad_group.png" }
];

const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyqsbM-SLexlpFCmKAOspEzpQXlRVgEucuA6Xl2e-YrlMdzL2F3TZF0OTvUGTEKtacSsQ/exec';

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
        userMemories = data.memories;
      }
    } else {
      console.error('Apps Script getMemories returned error status:', response.status);
    }
    
    // Combine user uploaded memories with default ones to ensure rolls are rich
    const combined = [...userMemories, ...defaultMemories];
    return NextResponse.json({ success: true, memories: combined });
  } catch (error) {
    console.error('Error fetching memories from Apps Script:', error);
    // Fallback to default memories if offline
    return NextResponse.json({ success: true, memories: defaultMemories });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const name = formData.get('name') || 'Người thương';
    const caption = formData.get('caption') || 'Chúc mừng tốt nghiệp!';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Chưa có ảnh nào được gửi!' }, { status: 400 });
    }

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
      if (data.success) {
        const combined = [...data.memories, ...defaultMemories];
        return NextResponse.json({ success: true, memories: combined });
      } else {
        console.error('Apps Script saveMemory failed:', data.error);
        return NextResponse.json({ success: false, message: data.error || 'Lỗi lưu trữ ảnh!' }, { status: 502 });
      }
    } else {
      console.error('Apps Script saveMemory returned error status:', response.status);
      return NextResponse.json({ success: false, message: 'Đồng bộ lưu trữ đám mây thất bại!' }, { status: 502 });
    }
  } catch (error) {
    console.error('Error uploading memory:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi tải ảnh lên Cloudinary!' }, { status: 500 });
  }
}
