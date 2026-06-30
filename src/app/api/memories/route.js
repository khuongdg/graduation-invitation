import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const getDbPath = () => path.join(process.cwd(), 'public', 'memories', 'memories.json');

export async function GET() {
  try {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ success: true, memories: defaultMemories });
    }
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const userMemories = JSON.parse(fileData);
    
    // Combine user uploaded memories with default ones to ensure rolls are rich
    const combined = [...userMemories, ...defaultMemories];
    return NextResponse.json({ success: true, memories: combined });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch memories' }, { status: 500 });
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

    // Convert file to buffer and write to public/memories/
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'memories');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(filePath, buffer);
    
    const imageUrl = `/memories/${safeFileName}`;
    
    // Save to memories.json
    const dbPath = getDbPath();
    let memories = [];
    if (fs.existsSync(dbPath)) {
      try {
        memories = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (e) {
        memories = [];
      }
    }
    
    const newMemory = {
      id: Date.now(),
      name,
      caption,
      imageUrl,
      timestamp: new Date().toISOString()
    };
    
    memories.unshift(newMemory); // Add to the beginning so user sees their photo immediately
    fs.writeFileSync(dbPath, JSON.stringify(memories, null, 2), 'utf8');
    
    // Return all combined memories
    const combined = [...memories, ...defaultMemories];
    return NextResponse.json({ success: true, memories: combined, newMemory });
  } catch (error) {
    console.error('Error uploading memory:', error);
    return NextResponse.json({ success: false, message: 'Lỗi tải ảnh lên máy chủ!' }, { status: 500 });
  }
}
