import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '@/config/siteConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache to prevent rapid duplicate submissions (within 15 seconds)
const recentRegistrations = new Map();

function isDuplicateRegistration(key) {
  const now = Date.now();
  const lastTime = recentRegistrations.get(key);
  if (lastTime && now - lastTime < 2000) {
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

function readLocalCsvRegistrations() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'registrations.csv');
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(l => l.trim() !== '');
    if (lines.length <= 1) return [];

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g);
      if (matches && matches.length >= 5) {
        const cleanValues = matches.map(m => {
          let v = m.replace(/^,/, '').trim();
          if (v.startsWith('"') && v.endsWith('"')) {
            v = v.substring(1, v.length - 1).replace(/""/g, '"');
          }
          return v;
        });
        result.push({
          id: cleanValues[0] || i,
          name: cleanValues[1] || 'Khách mời',
          phone: (cleanValues[2] || '').replace(/^'/, ''),
          email: cleanValues[3] || '',
          status: cleanValues[4] || 'Xác nhận tham gia',
          timestamp: cleanValues[5] || ''
        });
      }
    }
    return result;
  } catch (err) {
    console.error('Error reading local CSV:', err);
    return [];
  }
}

export async function GET() {
  try {
    const googleScriptUrl = siteConfig.googleScriptUrl;
    const params = new URLSearchParams({ action: 'getRegistrations' });

    let remoteRegistrations = [];
    let isRemoteSuccess = false;

    try {
      const response = await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.registrations)) {
          remoteRegistrations = data.registrations;
          isRemoteSuccess = true;
        }
      }
    } catch (remoteErr) {
      console.error('Failed to fetch registrations from Apps Script:', remoteErr);
    }

    if (isRemoteSuccess) {
      // Sync local CSV backup file with Google Sheets state (clears CSV if sheet is empty)
      try {
        const filePath = path.join(process.cwd(), 'public', 'registrations.csv');
        const csvHeader = 'STT,Họ và tên,Số điện thoại,Email,Trạng thái,Thời gian đăng ký\n';
        if (remoteRegistrations.length === 0) {
          fs.writeFileSync(filePath, '\ufeff' + csvHeader, 'utf8');
        } else {
          let stt = 1;
          const rows = remoteRegistrations.map((item) => {
            const formattedPhone = (item.phone || '').toString().startsWith("'") ? item.phone : `'${item.phone}`;
            return `"${stt++}","${(item.name || '').replace(/"/g, '""')}","${formattedPhone}","${(item.email || '').replace(/"/g, '""')}","${(item.status || 'Xác nhận tham gia').replace(/"/g, '""')}","${item.timestamp || item.time || ''}"`;
          });
          fs.writeFileSync(filePath, '\ufeff' + csvHeader + rows.join('\n') + '\n', 'utf8');
        }
      } catch (syncCsvErr) {
        console.error('Local CSV sync error:', syncCsvErr);
      }

      return NextResponse.json(
        { success: true, registrations: remoteRegistrations },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    // Fallback to local CSV file if Google Apps Script call failed
    const localRegistrations = readLocalCsvRegistrations();
    return NextResponse.json(
      { success: true, registrations: localRegistrations },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error getting registrations:', error);
    const fallback = readLocalCsvRegistrations();
    return NextResponse.json({ success: true, registrations: fallback });
  }
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
        stt = Math.max(1, lines.length);
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

    // 2. Sync request to Google Sheets Apps Script Web App (await to guarantee write completes)
    const googleScriptUrl = siteConfig.googleScriptUrl;
    const params = new URLSearchParams({
      name,
      phone,
      email,
      status: attendanceStatus
    });

    try {
      await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        redirect: 'follow',
        cache: 'no-store'
      });
    } catch (err) {
      console.error('Google Sheets sync warning:', err);
    }

    return NextResponse.json({ success: true, message: 'Đã lưu thông tin đăng ký thành công!' });

  } catch (error) {
    console.error('Error in proxy API:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!id && !email && !phone) {
      return NextResponse.json({ success: false, message: 'Thiếu thông tin cần xóa' }, { status: 400 });
    }

    const googleScriptUrl = siteConfig.googleScriptUrl;
    const params = new URLSearchParams({
      action: 'deleteRegistration',
      id: id || '',
      email: email || '',
      phone: phone || ''
    });

    try {
      await fetch(`${googleScriptUrl}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        next: { revalidate: 0 }
      });
    } catch (e) {
      console.error('Remote delete failed:', e);
    }

    // Also remove from local CSV if exists
    try {
      const filePath = path.join(process.cwd(), 'public', 'registrations.csv');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        if (lines.length > 1) {
          const header = lines[0];
          const newLines = [header];
          const targetEmail = (email || '').trim().toLowerCase();
          const targetPhone = (phone || '').replace(/^'/, '').trim();

          for (let i = 1; i < lines.length; i++) {
            const l = lines[i];
            const matches = l.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g);
            if (matches && matches.length >= 4) {
              const cleanValues = matches.map(m => {
                let v = m.replace(/^,/, '').trim();
                if (v.startsWith('"') && v.endsWith('"')) {
                  v = v.substring(1, v.length - 1).replace(/""/g, '"');
                }
                return v;
              });
              const rowPhone = (cleanValues[2] || '').replace(/^'/, '').trim();
              const rowEmail = (cleanValues[3] || '').trim().toLowerCase();

              if ((targetEmail && rowEmail === targetEmail) || (targetPhone && rowPhone === targetPhone)) {
                continue; // Skip matching line
              }
            }
            newLines.push(l);
          }
          fs.writeFileSync(filePath, newLines.join('\n') + '\n', 'utf8');
        }
      }
    } catch (csvErr) {
      console.error('Error updating local CSV on delete:', csvErr);
    }

    return GET();
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa' }, { status: 500 });
  }
}
