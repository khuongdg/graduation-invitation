'use client';

import React from 'react';
import FilmRoll from './FilmRoll';

export default function MemoriesSection({
  memoryWallRef,
  memories,
  selectedPhoto,
  setSelectedPhoto,
  isUploadOpen,
  uploadData,
  setUploadData,
  uploadState,
  imagePreviews,
  onOpenUploadModal,
  onCloseUploadModal,
  onUploadSubmit,
  onFileChange,
}) {
  return (
    <>
      <section className="memories-section" ref={memoryWallRef}>
        <h2 className="memories-header-title">
          Memory <span className="highlight-red">Wall</span>
        </h2>
        <p className="memories-subtitle">
          Gửi lời chúc, kỷ niệm đẹp và hình ảnh của bạn đến tôi nhé!
        </p>

        <button
          className="btn-confirm-attendance"
          style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          onClick={onOpenUploadModal}
        >
          + Thêm kỷ niệm
        </button>

        <div className="film-rolls-container">
          <FilmRoll memories={memories} direction="ltr" onPhotoClick={(p) => setSelectedPhoto(p)} />
          <FilmRoll memories={memories} direction="rtl" onPhotoClick={(p) => setSelectedPhoto(p)} />
        </div>
      </section>

      {/* Upload Memory Modal */}
      <div className={`glass-modal-overlay ${isUploadOpen ? 'open' : ''}`} onClick={onCloseUploadModal}>
        <div className="glass-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-icon" onClick={onCloseUploadModal}>✕</button>

          {uploadState !== 'success' ? (
            <>
              <h3 className="modal-form-title">Gửi Ảnh Kỷ Niệm/Lời chúc</h3>
              <form onSubmit={onUploadSubmit}>
                <div className="glass-input-group">
                  <label className="glass-input-label">Tên của bạn</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="glass-input-field"
                    value={uploadData.name}
                    onChange={(e) => setUploadData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="glass-input-group">
                  <label className="glass-input-label">Lời chúc / Lời nhắn</label>
                  <input
                    type="text"
                    required
                    placeholder="Chúc Khương thành công rực rỡ!"
                    className="glass-input-field"
                    value={uploadData.caption}
                    onChange={(e) => setUploadData((prev) => ({ ...prev, caption: e.target.value }))}
                  />
                </div>

                <div className="glass-input-group">
                  <label className="glass-input-label">
                    Chọn ảnh kỷ niệm <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>(Tùy chọn)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    required={false}
                    onChange={onFileChange}
                    className="glass-input-field"
                    style={{ padding: '8px' }}
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
                    {imagePreviews.map((p, idx) => (
                      <img key={idx} src={p} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    ))}
                  </div>
                )}

                <button type="submit" className="glass-submit-btn" disabled={uploadState === 'loading'}>
                  {uploadState === 'loading' ? 'Đang gửi...' : 'Gửi Lời Chúc / Kỷ Niệm 🚀'}
                </button>
              </form>
            </>
          ) : (
            <div className="success-modal-wrapper">
              <div className="success-confetti-container">
                <span className="confetti-item c1">📸</span>
                <span className="confetti-item c2">✨</span>
                <span className="confetti-item c3">🎞️</span>
                <span className="confetti-item c4">⭐</span>
                <span className="confetti-item c5">🎊</span>
                <span className="confetti-item c6">✨</span>
              </div>

              <div className="success-badge-container">
                <div className="success-badge-ripple"></div>
                <div className="success-check-badge">
                  <svg className="success-check-svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <h3 className="success-modal-title">Gửi thành công!</h3>
              <p className="success-modal-desc">
                Lời chúc/Ảnh của bạn đã được đưa lên cuộn phim kỷ niệm! 🎞️✨
              </p>
              <button className="glass-submit-btn success-btn-anim" onClick={onCloseUploadModal}>
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo / Letter Lightbox Popup */}
      {selectedPhoto && (
        <div className="glass-modal-overlay open" onClick={() => setSelectedPhoto(null)} style={{ zIndex: 10000 }}>
          <div className="glass-modal-content photo-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSelectedPhoto(null)}>✕</button>

            {(selectedPhoto.imageUrl || selectedPhoto.image) ? (
              <>
                <div className="lightbox-image-wrapper">
                  <img
                    src={selectedPhoto.imageUrl || selectedPhoto.image}
                    alt={selectedPhoto.name || selectedPhoto.title || 'Kỷ niệm'}
                    className="lightbox-image"
                  />
                </div>
                {(selectedPhoto.name || selectedPhoto.title || selectedPhoto.caption) && (
                  <div className="lightbox-caption-box">
                    <div className="lightbox-header-row">
                      {(selectedPhoto.name || selectedPhoto.title) && (
                        <h4 className="lightbox-title">
                          <span>💌</span>
                          <span>{selectedPhoto.name || selectedPhoto.title}</span>
                        </h4>
                      )}

                      {(selectedPhoto.time || selectedPhoto.date || selectedPhoto.timestamp || selectedPhoto.createdAt) && (
                        <span className="lightbox-time-badge">
                          {selectedPhoto.time || selectedPhoto.date || selectedPhoto.timestamp || selectedPhoto.createdAt}
                        </span>
                      )}
                    </div>

                    {selectedPhoto.caption && (
                      <p className="lightbox-photo-caption">
                        “{selectedPhoto.caption}”
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Text-Only Wish Letter Card View */
              <div className="lightbox-letter-modal-card">
                <div className="letter-modal-seal">💌</div>
                <h3 className="letter-modal-title">
                  {selectedPhoto.name || selectedPhoto.title || 'Người bạn thân'}
                </h3>
                {(selectedPhoto.time || selectedPhoto.date || selectedPhoto.timestamp || selectedPhoto.createdAt) && (
                  <span className="letter-modal-time">
                    {selectedPhoto.time || selectedPhoto.date || selectedPhoto.timestamp || selectedPhoto.createdAt}
                  </span>
                )}
                <div className="letter-modal-divider" />
                <p className="letter-modal-content">
                  “{selectedPhoto.caption || ''}”
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
