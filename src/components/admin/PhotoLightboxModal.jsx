'use client';

import React from 'react';
import { formatImageUrl } from '@/utils/image';

export default function PhotoLightboxModal({ selectedPhoto, setSelectedPhoto }) {
  if (!selectedPhoto) return null;

  return (
    <div className="glass-modal-overlay open" onClick={() => setSelectedPhoto(null)} style={{ zIndex: 10000 }}>
      <div className="glass-modal-content photo-lightbox-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={() => setSelectedPhoto(null)}>✕</button>

        {Boolean(selectedPhoto.imageUrl || selectedPhoto.image) ? (
          <>
            <div className="lightbox-image-wrapper">
              <img
                src={formatImageUrl(selectedPhoto.imageUrl || selectedPhoto.image)}
                alt={selectedPhoto.name || selectedPhoto.title || 'Kỷ niệm'}
                className="lightbox-image"
              />
            </div>
            {(selectedPhoto.name || selectedPhoto.title || selectedPhoto.caption) && (
              <div className="lightbox-caption-box">
                <div className="lightbox-header-row">
                  {(selectedPhoto.name || selectedPhoto.title) && (
                    <h4 style={{ margin: 0, color: '#FFF', fontSize: '1.2rem', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <p className="lightbox-photo-caption" style={{ marginTop: (selectedPhoto.name || selectedPhoto.title) ? '8px' : '0px', color: 'rgba(255, 255, 255, 0.85)', fontStyle: 'italic' }}>
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
              {selectedPhoto.name || selectedPhoto.title || 'Lời chúc kỷ niệm'}
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
  );
}
