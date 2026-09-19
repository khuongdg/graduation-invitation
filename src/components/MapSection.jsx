'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function MapSection() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMapModalOpen(false);
    };
    if (isMapModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapModalOpen]);

  return (
    <section className="map-section">
      <h2 style={{ fontSize: '2rem', color: '#FFF', margin: '0 0 8px 0', textAlign: 'center' }}>Địa điểm</h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', margin: '0 0 24px 0', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
        Trường Đại học Tôn Đức Thắng, số 19 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Tp. Hồ Chí Minh
      </p>

      {/* Clickable Map Image with Hint Badge */}
      <div 
        className="map-container" 
        onClick={() => setIsMapModalOpen(true)}
        title="Bấm để phóng to sơ đồ"
      >
        <img src="/assets/tdtu_mapv1.png" alt="Sơ đồ tổng quát TDTU" className="map-image" />
        <div className="map-zoom-hint-badge">
          🔍 Phóng to
        </div>
      </div>

      {/* 2 Location Details Cards below the map */}
      <div className="map-info-cards-grid">
        <div className="map-info-card">
          <div className="map-info-icon-wrap">📍</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">Địa điểm chính thức</h4>
            <p className="map-info-card-desc">
              Hội trường lớn Tòa nhà A, Trường Đại học Tôn Đức Thắng.
            </p>
          </div>
        </div>

        <div className="map-info-card">
          <div className="map-info-icon-wrap">🛵</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">Cổng vào & Gửi xe</h4>
            <p className="map-info-card-desc">
              Các bạn đi vào bằng <strong>Cổng 7</strong> hoặc <strong>Cổng 5</strong> (Đường D6). Gửi xe máy tại tầng hầm Nhà Thi Đấu (kế bên sân bóng đá) hoặc tầng hầm Tòa nhà F, D, L.
            </p>
          </div>
        </div>
      </div>

      {/* Map Lightbox Modal Portal (Maximizing Map Image View, Single Line Google Maps Button) */}
      {isMapModalOpen && mounted && createPortal(
        <div 
          className="glass-modal-overlay open" 
          onClick={() => setIsMapModalOpen(false)} 
          style={{ zIndex: 100000 }}
        >
          <div 
            className="glass-modal-content map-lightbox-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '840px', width: '96%', padding: '16px 12px 14px 12px' }}
          >
            <button className="modal-close-icon" onClick={() => setIsMapModalOpen(false)}>✕</button>
            
            <div style={{
              width: '100%',
              maxHeight: '76vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.25)'
            }}>
              <img
                src="/assets/tdtu_mapv1.png"
                alt="Sơ đồ tổng quát TDTU"
                style={{
                  maxWidth: '100%',
                  maxHeight: '76vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  display: 'block'
                }}
              />
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center', width: '100%' }}>
              <a 
                href="https://maps.google.com/?q=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+T%C3%B4n+%C4%90%E1%BB%A9c+Th%E1%BA%AFng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-google-btn"
                style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', whiteSpace: 'nowrap' }}
              >
                📍 Mở Google Maps chỉ đường ➔
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
