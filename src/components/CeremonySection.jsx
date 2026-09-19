'use client';

import React from 'react';

export default function CeremonySection({ onOpenModal }) {
  return (
    <section className="invitation-card">
      {/* Graduation cap badge icon */}
      <div className="invitation-badge-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>

      <div className="invitation-subtitle">YOU ARE INVITED TO</div>
      <h2 className="invitation-main-title">
        Graduation <span className="highlight-ceremony">Ceremony</span>
      </h2>

      {/* Detail Cards Row */}
      <div className="invitation-details-grid">
        <div className="detail-item-box">
          <span className="detail-icon-wrap">🗓️</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">20</span>
            <span className="detail-text-main">SEPTEMBER 2026</span>
          </div>
        </div>

        <div className="detail-item-box">
          <span className="detail-icon-wrap">⏰</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">08:00</span>
            <span className="detail-text-main">AM</span>
          </div>
        </div>

        <div className="detail-item-box">
          <span className="detail-icon-wrap">📍</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">HALL A</span>
            <span className="detail-text-sep">•</span>
            <span className="detail-text-main">Ton Duc Thang University</span>
          </div>
        </div>
      </div>

      <p className="invitation-subtext">
        Sự hiện diện của bạn là niềm vinh hạnh cho tôi trong ngày trọng đại này!
      </p>

      <button className="btn-confirm-attendance" onClick={onOpenModal}>
        <span>Xác nhận tham dự</span>
        <div className="pill-arrow-circle" style={{ background: 'rgba(255,255,255,0.25)' }}>➔</div>
      </button>
    </section>
  );
}
