'use client';

import React from 'react';
import { formatImageUrl } from '@/utils/image';

export default function JourneySection({ section2Ref, onOpenGlobeModal, onScrollToMemories, photos = [], onPhotoClick }) {
  const safePhotos = Array.isArray(photos) ? photos : [];

  // Filter ONLY starred/featured photos selected in Admin
  const featuredPhotos = safePhotos.filter(p => p.isFeatured);

  let displayPhotos = [];
  if (featuredPhotos.length > 0) {
    displayPhotos = featuredPhotos.slice(0, 5);
  } else {
    displayPhotos = safePhotos.slice(0, 5);
  }

  const mainPhoto = displayPhotos[0];
  const subPhotos = displayPhotos.slice(1);

  return (
    <section className="journey-card" ref={section2Ref}>
      {/* Narrative column */}
      <div>
        <h2 className="journey-header-title">
          <span className="journey-title-script">My Journey</span>
          <span className="journey-title-serif">at TDTU</span>
        </h2>

        {/* Vertical Memory Timeline (Timeline Hồi Ức Dọc) */}
        <div className="journey-timeline">
          <div className="journey-timeline-line" />

          {/* Timeline Node 1: Thanh Xuân & Bạn Bè */}
          <div className="journey-timeline-item">
            <div className="timeline-node-icon amber-glow">🌸</div>
            <div className="timeline-content-card">
              <div className="timeline-card-tag tag-amber">
                <span>01. Thanh xuân & Bạn bè</span>
              </div>
              <p className="timeline-card-text">
                Từ một tân sinh viên còn nhiều bỡ ngỡ, mình đã trải qua những năm tháng thanh xuân tuyệt đẹp tại <strong className="highlight-text-amber">TDTU</strong>. Mình đã có cơ hội được gặp những người bạn mới, luôn trân trọng những <strong className="highlight-text-amber">"người thương"</strong> đã ở bên cạnh dù hoàn cảnh thế nào.
              </p>
            </div>
          </div>

          {/* Timeline Node 2: Tri Ân Thầy Cô */}
          <div className="journey-timeline-item">
            <div className="timeline-node-icon blue-glow">🏫</div>
            <div className="timeline-content-card">
              <div className="timeline-card-tag tag-blue">
                <span>02. Tri ân Thầy Cô</span>
              </div>
              <p className="timeline-card-text">
                Cảm ơn <strong className="highlight-text-blue">thầy cô</strong> đã hướng dẫn, đồng hành suốt những năm tháng tại trường. Cảm ơn những người bạn dù có khoảng thời gian đồng hành cùng nhau ngắn nhưng tất cả đều là những <strong className="highlight-text-blue">hồi ức tuổi trẻ</strong> được mình ghi nhớ mãi.
              </p>
            </div>
          </div>

          {/* Timeline Node 3: Điểm Tựa Gia Đình */}
          <div className="journey-timeline-item">
            <div className="timeline-node-icon pink-glow">❤️</div>
            <div className="timeline-content-card">
              <div className="timeline-card-tag tag-pink">
                <span>03. Điểm tựa Gia đình</span>
              </div>
              <p className="timeline-card-text">
                Biết ơn <strong className="highlight-text-pink">cha mẹ & gia đình</strong> - những người đã nuôi dưỡng con từ bé cho đến ngày hôm nay, đã dạy những bài học đầu đời cho đến khi tiếp bước cho con có những thành quả tại TDTU.
              </p>
            </div>
          </div>
        </div>

        <button className="btn-pill-dark" onClick={onOpenGlobeModal || onScrollToMemories}>
          <span>Xem thêm ảnh</span>
          <div className="pill-arrow-circle">➔</div>
        </button>
      </div>

      {/* Photo Gallery Grid Collage */}
      {displayPhotos.length === 0 ? (
        <div className="journey-gallery-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div
            className="gallery-photo-main"
            style={{
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(0, 240, 255, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📸</div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#00F0FF' }}>
              Chưa có ảnh hành trình nào
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              Tải ảnh lên trong trang Admin để hiển thị tại đây! ✨
            </div>
          </div>
        </div>
      ) : (
        <div
          className="journey-gallery-grid"
          style={{
            gridTemplateColumns: subPhotos.length === 0 ? '1fr' : undefined
          }}
        >
          {mainPhoto && (
            <div
              className="gallery-photo-main"
              onClick={() => onPhotoClick && onPhotoClick(mainPhoto)}
              style={{
                minHeight: subPhotos.length === 0 ? '340px' : '280px',
                cursor: onPhotoClick ? 'pointer' : 'default'
              }}
            >
              <img src={formatImageUrl(mainPhoto.imageUrl)} alt={mainPhoto.title || 'TDTU Campus'} />
            </div>
          )}

          {subPhotos.length > 0 && (
            <div
              className="gallery-sub-grid"
              style={{
                gridTemplateColumns: subPhotos.length === 1 ? '1fr' : '1fr 1fr'
              }}
            >
              {subPhotos.map((p, idx) => (
                <div
                  className="gallery-photo-sub"
                  key={p.id || idx}
                  onClick={() => onPhotoClick && onPhotoClick(p)}
                  style={{
                    height: subPhotos.length <= 2 ? '100%' : '135px',
                    minHeight: '135px',
                    cursor: onPhotoClick ? 'pointer' : 'default'
                  }}
                >
                  <img src={formatImageUrl(p.imageUrl)} alt={p.title || 'Kỷ niệm'} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
