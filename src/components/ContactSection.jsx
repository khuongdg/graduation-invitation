'use client';

import React from 'react';

export default function ContactSection() {
  return (
    <section className="contact-section">
      <div className="contact-card-wrap">
        <h2 className="contact-main-heading">
          Sự hiện diện của bạn là niềm vinh hạnh lớn của mình! ❤️
        </h2>
        <p className="contact-sub-heading">
          Rất mong được đón tiếp bạn trong ngày lễ tốt nghiệp trọng đại này!
        </p>

        <div className="contact-links-grid">
          <a href="tel:0945629869" className="contact-link-pill">
            <span className="contact-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <div>
              <div className="contact-label">Số điện thoại / Zalo</div>
              <div className="contact-value">0945 629 869</div>
            </div>
          </a>

          <a
            href="https://facebook.com/kduong.kero/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link-pill contact-fb-pill"
          >
            <span className="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                <path d="M15.5 12h-2.5V24h-4.5V12h-2V8.5h2V6.3c0-2.3 1.2-3.8 3.8-3.8h2.7v3.5h-1.7c-1.1 0-1.3.4-1.3 1.2v1.3h3l-.5 3.5z" fill="#FFFFFF"/>
              </svg>
            </span>
            <div>
              <div className="contact-label">Facebook cá nhân</div>
              <div className="contact-value">facebook.com/kduong.kero</div>
            </div>
            <span className="contact-arrow">➔</span>
          </a>
        </div>
      </div>
    </section>
  );
}
