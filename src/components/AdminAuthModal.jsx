'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Valid admin passwords
    const validPasswords = ['admin', '123456', 'khuong2026', 'khuong', 'admin123'];

    if (validPasswords.includes(password.trim().toLowerCase())) {
      setLoading(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_authenticated', 'true');
      }
      setTimeout(() => {
        router.push('/admin');
        onClose();
        setPassword('');
        setLoading(false);
      }, 400);
    } else {
      setErrorMsg('Mật khẩu không chính xác! Vui lòng thử lại.');
    }
  };

  return (
    <div className="glass-modal-overlay open" onClick={onClose}>
      <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close modal">✕</button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            fontSize: '1.6rem'
          }}>
            🔐
          </div>
          <h3 className="modal-form-title" style={{ margin: 0 }}>Quản Trị Admin</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginTop: '6px' }}>
            Nhập mật khẩu để truy cập trang quản lý ảnh Section Journey
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(255, 42, 85, 0.18)',
            border: '1px solid #FF2A55',
            color: '#FF6B8B',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="glass-input-group">
            <label className="glass-input-label">Mật khẩu Admin</label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Nhập mật khẩu..."
              className="glass-input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="glass-submit-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Đang chuyển hướng...' : 'Xác Nhận Truy Cập 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
