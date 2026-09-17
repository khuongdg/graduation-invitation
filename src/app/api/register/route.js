import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory cache to prevent rapid duplicate submissions (within 15 seconds)
const recentRegistrations = new Map();

function isDuplicateRegistration(key) {
  const now = Date.now();
  const lastTime = recentRegistrations.get(key);
  if (lastTime && now - lastTime < 15000) {
    return true;
  }
  recentRegistrations.set(key, now);
  
  // Clean up entries older than 60s
  if (recentRegistrations.size > 100) {
    for (const [k, time] of recentRegistrations.entries()) {
      if (now - time > 60000) recentRegistrations.delete(k);
    }
  }
  return false;
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, email, status } = data;
    const attendanceStatus = status || 'Xác nhận tham gia';

    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const dupKey = `${name.trim().toLowerCase()}_${phone.trim()}_${email.trim().toLowerCase()}_${attendanceStatus}`;
    if (isDuplicateRegistration(dupKey)) {
      console.log(`[Deduplication] Duplicate registration request ignored for: ${name}`);
      return NextResponse.json({ success: true, message: 'Duplicate request ignored' });
    }

    // 1. Write to local CSV file as a backup
    try {
      const filePath = path.join(process.cwd(), 'public', 'registrations.csv');
      const fileExists = fs.existsSync(filePath);
      const csvHeader = 'STT,Họ và tên,Số điện thoại,Email,Trạng thái,Thời gian đăng ký\n';
      const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      
      let stt = 1;
      if (fileExists) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim() !== '');
        stt = Math.max(1, lines.length); // header is line 1, first entry is 1
      }

      const formattedPhone = phone.startsWith("'") ? phone : `'${phone}`;
      const csvRow = `"${stt}","${name.replace(/"/g, '""')}","${formattedPhone}","${email.replace(/"/g, '""')}","${attendanceStatus.replace(/"/g, '""')}","${timestamp}"\n`;

      if (!fileExists) {
        fs.writeFileSync(filePath, '\ufeff' + csvHeader + csvRow, 'utf8');
      } else {
        fs.appendFileSync(filePath, csvRow, 'utf8');
      }
    } catch (csvError) {
      console.error('Backup CSV writing failed:', csvError);
    }

    // 2. Proxy request to Google Sheets Apps Script Web App (using GET with query params)
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbx-GSi_AUvfJEw-VPTAnEsAsac12aaX45IPYhA0kSEP_QfT40J7koeRnGb_YsY662NDyw/exec';
    const params = new URLSearchParams({
      name,
      phone,
      email,
      status: attendanceStatus
    });

    const googleResponse = await fetch(`${googleScriptUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    if (googleResponse.ok) {
      return NextResponse.json({ success: true, message: 'Saved to Google Sheets' });
    } else {
      console.error('Google Sheets Apps Script returned error status:', googleResponse.status);
      return NextResponse.json({ success: false, message: 'Google Sheets sync failed' }, { status: 502 });
    }

  } catch (error) {
    console.error('Error in proxy API:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
