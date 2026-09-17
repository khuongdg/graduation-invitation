'use client';

import React from 'react';

const defaultFallbackPhotos = [
  { id: 'def-1', title: "Khuôn viên TDTU", imageUrl: "/default_memories/memory_grad_solo.png" },
  { id: 'def-2', title: "Nhóm bạn thân", imageUrl: "/default_memories/memory_grad_chibi.png" },
  { id: 'def-3', title: "Lễ Tốt Nghiệp", imageUrl: "/default_memories/memory_grad_cap.png" },
  { id: 'def-4', title: "Thầy cô & Bạn bè", imageUrl: "/default_memories/memory_grad_group.png" },
  { id: 'def-5', title: "Hành trình mới", imageUrl: "/assets/test.JPG" }
];

export default function JourneySection({ section2Ref, onOpenGlobeModal, onScrollToMemories, photos = [], onPhotoClick }) {
  const safePhotos = (Array.isArray(photos) && photos.length > 0) ? photos : defaultFallbackPhotos;

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

        <div className="journey-description">
          <p>
            Từ một cậu sinh viên còn nhiều bỡ ngỡ, mình đã trải qua những năm tháng thanh xuân tại TDTU. Mình đã có cơ hội được gặp những người bạn mới, mình luôn trân trọng những người bạn ở bên cạnh dù hoản cảnh thế nào. Cũng cảm ơn những người bạn dù có khoảng thời gian đồng hành cùng nhau ngắn nhưng tất cả đều là những hồi ức tuổi trẻ được mình ghi nhớ mãi.
          </p>
          <p>
            Biết ơn cha mẹ, gia đình những người đã nuôi dưỡng con từ bé cho đến ngày hôm nay, đã dạy những bài học đầu đời cho đến khi tiếp bước cho con có những bài học tại TDTU. Cảm ơn thầy cô đã hướng dẫn, đồng hành suốt những năm tháng tại trường.
          </p>
        </div>

        <button className="btn-pill-dark" onClick={onOpenGlobeModal || onScrollToMemories}>
          <span>Xem thêm ảnh</span>
          <div className="pill-arrow-circle">➔</div>
        </button>
      </div>

      {/* Photo Gallery Grid Collage */}
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
            <img src={mainPhoto.imageUrl} alt={mainPhoto.title || 'TDTU Campus'} />
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
                <img src={p.imageUrl} alt={p.title || 'Kỷ niệm'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
