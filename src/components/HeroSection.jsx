'use client';

import React from 'react';

export default function HeroSection({ heroRef, parallaxOffset, onBeginJourney, onOpenAdminModal }) {
  return (
    <main className="hero-card-fullscreen" ref={heroRef}>
      {/* Menu button inside hero header actions (Top-Right) */}
      <div className="hero-header-actions">
        <button
          className="hamburger-btn-moved"
          aria-label="Admin Menu"
          onClick={onOpenAdminModal}
          title="Quản trị Admin"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
        </button>
      </div>

      {/* Center Content Layer with Parallax depth */}
      <div
        className="hero-content-layer"
        style={{
          transform: `translate(${parallaxOffset.x * 12}px, ${parallaxOffset.y * 12}px)`
        }}
      >
        {/* Circular Liquid Glass Ring surrounding TDTU Logo */}
        <div className="hero-logo-ring">
          <img src="/assets/logoTDTU.png" alt="TDTU Logo" className="hero-tdtu-logo" />
        </div>

        {/* Main Title: Graduation Invitation */}
        <h1 className="hero-title-main">Graduation Invitation</h1>

        {/* Subtitle Gradient: Class of 2026 */}
        <div className="hero-title-class-gradient">Class of 2026</div>

        {/* Student Name inside Frosted Liquid Glass Badge */}
        <div className="hero-candidate-badge">
          <span className="hero-candidate-name">DƯƠNG NHỰT KHƯƠNG</span>
        </div>

        {/* Quote */}
        <p className="hero-quote-italic">
          “Every ending is the beginning of something new.”
        </p>

        {/* Primary CTA Liquid Glass Button */}
        <button className="btn-begin-journey" onClick={onBeginJourney}>
          <span>Begin the Journey →</span>
        </button>

        {/* Bottom Scroll Down Indicator */}
        <button className="hero-scroll-btn" onClick={onBeginJourney}>
          <span>Scroll Down</span>
          <div className="scroll-icon-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
      </div>
    </main>
  );
}
