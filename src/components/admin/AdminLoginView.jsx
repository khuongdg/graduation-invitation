'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminLoginView({
  passwordInput,
  setPasswordInput,
  authError,
  handleLoginSubmit
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060711',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#00F0FF' }}>Đăng Nhập Admin</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '6px', marginBottom: '24px' }}>
          Vui lòng nhập mật khẩu quản trị để mở trang Admin Dashboard
        </p>

        {authError && (
          <div style={{
            background: 'rgba(255, 42, 85, 0.18)',
            border: '1px solid #FF2A55',
            color: '#FF6B8B',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            marginBottom: '18px'
          }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            required
            autoFocus
            placeholder="Nhập mật khẩu..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFF',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00F0FF, #7000FF)',
              color: '#FFF',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Đăng Nhập 🚀
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
