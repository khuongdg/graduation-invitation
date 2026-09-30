'use client';

import React, { useState, useEffect } from 'react';
import { siteConfig } from '@/config/siteConfig';

function calculateTimeLeft(targetDateStr) {
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const difference = target - now;

  if (isNaN(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false
  };
}

export default function CeremonySection({ onOpenModal }) {
  const { ceremony } = siteConfig;
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const target = ceremony.targetDate || '2026-10-17T08:00:00';
    setTimeLeft(calculateTimeLeft(target));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(interval);
  }, [ceremony.targetDate]);

  return (
    <section className="invitation-card">
      {/* Graduation cap badge icon */}
      <div className="invitation-badge-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>

      <div className="invitation-subtitle">{ceremony.subtitle}</div>
      <h2 className="invitation-main-title">
        {ceremony.mainTitlePrefix} <span className="highlight-ceremony">{ceremony.mainTitleHighlight}</span>
      </h2>

      {/* Detail Cards Row */}
      <div className="invitation-details-grid">
        <div className="detail-item-box">
          <span className="detail-icon-wrap">🗓️</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">{ceremony.day}</span>
            <span className="detail-text-main">{ceremony.monthYear}</span>
          </div>
        </div>

        <div className="detail-item-box">
          <span className="detail-icon-wrap">⏰</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">{ceremony.time}</span>
            <span className="detail-text-main">{ceremony.period}</span>
          </div>
        </div>

        <div className="detail-item-box">
          <span className="detail-icon-wrap">📍</span>
          <div className="detail-content-inline">
            <span className="detail-text-highlight">{ceremony.locationHall}</span>
            <span className="detail-text-sep">•</span>
            <span className="detail-text-main">{ceremony.locationVenue}</span>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="ceremony-countdown-wrap">
        <div className="countdown-header-tag">
          <span className="countdown-pulse-dot"></span>
          <span>Đếm ngược tới ngày lễ</span>
        </div>

        <div className="countdown-grid">
          <div className="countdown-box">
            <span className="countdown-value">{String(timeLeft?.days ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">NGÀY</span>
          </div>
          <span className="countdown-colon">:</span>
          <div className="countdown-box">
            <span className="countdown-value">{String(timeLeft?.hours ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">GIỜ</span>
          </div>
          <span className="countdown-colon">:</span>
          <div className="countdown-box">
            <span className="countdown-value">{String(timeLeft?.minutes ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">PHÚT</span>
          </div>
          <span className="countdown-colon">:</span>
          <div className="countdown-box">
            <span className="countdown-value">{String(timeLeft?.seconds ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">GIÂY</span>
          </div>
        </div>
      </div>

      <p className="invitation-subtext">
        {ceremony.subtext}
      </p>

      <button className="btn-confirm-attendance" onClick={onOpenModal}>
        <span>{ceremony.buttonText}</span>
        <div className="pill-arrow-circle" style={{ background: 'rgba(255,255,255,0.25)' }}>➔</div>
      </button>
    </section>
  );
}
