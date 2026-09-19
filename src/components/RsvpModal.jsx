'use client';

import React from 'react';

export default function RsvpModal({
  isModalOpen,
  onCloseModal,
  submitState,
  onSubmit,
  formData,
  onInputChange,
  setFormData,
}) {
  return (
    <div className={`glass-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={onCloseModal}>
      <div className="glass-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onCloseModal} aria-label="Close modal">✕</button>

        {submitState !== 'success' ? (
          <>
            <h3 className="modal-form-title">Xác nhận tham dự</h3>
            <form onSubmit={onSubmit}>
              <div className="glass-input-group">
                <label className="glass-input-label">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  className="glass-input-field"
                  value={formData.name}
                  onChange={onInputChange}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-input-label">Số điện thoại</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Nhập số điện thoại"
                  className="glass-input-field"
                  value={formData.phone}
                  onChange={onInputChange}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-input-label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Nhập email"
                  className="glass-input-field"
                  value={formData.email}
                  onChange={onInputChange}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-input-label">Trạng thái tham dự</label>
                <div className="glass-status-pills">
                  <button
                    type="button"
                    className={`glass-status-pill ${formData.status === 'Xác nhận tham gia' ? 'active-confirm' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, status: 'Xác nhận tham gia' }))}
                  >
                    <span className="pill-icon">🎉</span>
                    <span>Xác nhận tham gia</span>
                  </button>
                  <button
                    type="button"
                    className={`glass-status-pill ${formData.status === 'Bận không tham gia' ? 'active-busy' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, status: 'Bận không tham gia' }))}
                  >
                    <span className="pill-icon">💌</span>
                    <span>Bận không tham gia</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="glass-submit-btn" disabled={submitState === 'loading'}>
                {submitState === 'loading' ? 'Đang gửi...' : 'Submit'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="success-check-badge">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.8rem', color: '#FFF', margin: '0 0 10px 0' }}>Thank You!</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {formData.status === 'Xác nhận tham gia'
                ? 'Bạn đã xác nhận tham dự thành công. Hẹn gặp bạn tại lễ tốt nghiệp!'
                : 'Cảm ơn bạn đã phản hồi. Rất tiếc vì bạn không thể tham dự, hẹn gặp bạn vào một dịp gần nhất nhé!'}
            </p>
            <button className="glass-submit-btn" onClick={onCloseModal}>
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
