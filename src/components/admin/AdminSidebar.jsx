'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  rsvpsCount
}) {
  const getTabTitle = () => {
    if (activeTab === 'journey') return 'Section 2 (My Journey)';
    if (activeTab === 'memories') return 'Section 5 (Memory Wall)';
    return 'Khách Mời';
  };

  return (
    <>
      {/* Mobile Sticky Bar with Left Hamburger Menu Button */}
      <div className="admin-mobile-top-bar">
        <button
          type="button"
          className="admin-mobile-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {isMobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </span>
          <span style={{ lineHeight: 1 }}>{isMobileMenuOpen ? 'Đóng Menu' : 'Menu Quản Trị'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#0284C7', fontWeight: '700' }}>
          <span>⚙️</span>
          <span>{getTabTitle()}</span>
        </div>
      </div>

      {/* Mobile Menu Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Navigation Sidebar Menu */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          {/* Dashboard Header */}
          <div className="admin-sidebar-header" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>⚙️</span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#00F0FF', fontWeight: 700 }}>
                Admin Dashboard
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Quản trị Lễ Tốt Nghiệp TDTU
            </p>
          </div>

          {/* Navigation Items */}
          <div className="admin-nav-group">
            <button
              onClick={() => {
                setActiveTab('journey');
                setIsMobileMenuOpen(false);
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="admin-nav-button"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: activeTab === 'journey' ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'journey' ? 'linear-gradient(135deg, rgba(0,240,255,0.18), rgba(112,0,255,0.18))' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'journey' ? '#00F0FF' : 'rgba(255,255,255,0.75)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'journey' ? '0 4px 20px rgba(0, 240, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📸</span> My Journey
              </div>
              <div style={{ fontSize: '0.78rem', color: activeTab === 'journey' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Chọn 5 ảnh đại diện (Gắn sao ⭐)
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('memories');
                setIsMobileMenuOpen(false);
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="admin-nav-button"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: activeTab === 'memories' ? '1px solid #FF2A55' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'memories' ? 'linear-gradient(135deg, rgba(255,42,85,0.18), rgba(147,51,234,0.18))' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'memories' ? '#FF6B8B' : 'rgba(255,255,255,0.75)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'memories' ? '0 4px 20px rgba(255, 42, 85, 0.25)' : 'none'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎞️</span> Memory Wall
              </div>
              <div style={{ fontSize: '0.78rem', color: activeTab === 'memories' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Quản lý ảnh & lời chúc với bạn bè
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('rsvps');
                setIsMobileMenuOpen(false);
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="admin-nav-button"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: activeTab === 'rsvps' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'rsvps' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.18))' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'rsvps' ? '#34D399' : 'rgba(255,255,255,0.75)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'rsvps' ? '0 4px 20px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📩</span> Khách Mời ({rsvpsCount})
              </div>
              <div style={{ fontSize: '0.78rem', color: activeTab === 'rsvps' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Xem danh sách người xác nhận tham dự
              </div>
            </button>
          </div>
        </div>

        {/* Back to Website Button */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              textDecoration: 'none',
              fontSize: '0.9rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            ← Về trang chủ
          </Link>
        </div>
      </aside>
    </>
  );
}
