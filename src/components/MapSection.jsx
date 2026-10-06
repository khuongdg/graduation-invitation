'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { siteConfig } from '@/config/siteConfig';

export default function MapSection() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { map } = siteConfig;

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
      <h2 style={{ fontSize: '2rem', color: '#FFF', margin: '0 0 10px 0', textAlign: 'center' }}>{map.title}</h2>
      <div style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#53cef0ff', fontWeight: '700', margin: '0 0 4px 0' }}>
          {map.schoolName || 'Trường Đại học Tôn Đức Thắng'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.95rem' }}>
          {map.addressDetail || 'Số 19 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Tp. Hồ Chí Minh'}
        </p>
      </div>

      {/* Clickable Map Image with Hint Badge */}
      <div 
        className="map-container" 
        onClick={() => setIsMapModalOpen(true)}
        title="Bấm để phóng to sơ đồ"
      >
        <img src={map.image} alt="Sơ đồ tổng quát TDTU" className="map-image" />
        <div className="map-zoom-hint-badge">
          🔍 Chỉ đường
        </div>
      </div>

      {/* 2 Location Details Cards below the map */}
      <div className="map-info-cards-grid">
        <div className="map-info-card">
          <div className="map-info-icon-wrap">📍</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">{map.cards.locationTitle}</h4>
            <p className="map-info-card-desc">
              {map.cards.locationDesc}
            </p>
          </div>
        </div>

        <div className="map-info-card">
          <div className="map-info-icon-wrap">🛵</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">{map.cards.parkingTitle}</h4>
            <p className="map-info-card-desc">
              {map.cards.parkingDesc}
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
                src={map.image}
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
                href={map.googleMapsUrl} 
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
