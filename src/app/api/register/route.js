import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, email } = data;

    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    // 1. Write to local CSV file as a backup
    try {
      const filePath = path.join(process.cwd(), 'public', 'registrations.csv');
      const fileExists = fs.existsSync(filePath);
      const csvHeader = 'Họ và tên,Số điện thoại,Email,Thời gian đăng ký\n';
      const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const csvRow = `"${name.replace(/"/g, '""')}","${phone.replace(/"/g, '""')}","${email.replace(/"/g, '""')}","${timestamp}"\n`;

      if (!fileExists) {
        fs.writeFileSync(filePath, '\ufeff' + csvHeader + csvRow, 'utf8');
      } else {
        fs.appendFileSync(filePath, csvRow, 'utf8');
      }
    } catch (csvError) {
      console.error('Backup CSV writing failed:', csvError);
    }

    // 2. Proxy request to Google Sheets Apps Script Web App (using GET with query params to avoid POST-redirect body loss in Node)
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyqsbM-SLexlpFCmKAOspEzpQXlRVgEucuA6Xl2e-YrlMdzL2F3TZF0OTvUGTEKtacSsQ/exec';
    const params = new URLSearchParams({ name, phone, email });

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
