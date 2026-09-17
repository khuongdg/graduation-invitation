'use client';

import React from 'react';

export default function MapSection() {
  return (
    <section className="map-section">
      <h2 style={{ fontSize: '2rem', color: '#FFF', margin: '0 0 8px 0', textAlign: 'center' }}>Location</h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', margin: '0 0 24px 0', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
        Trường Đại học Tôn Đức Thắng, số 19 đường Nguyễn Hữu Thọ, Phường Tân Hưng, Tp. Hồ Chí Minh
      </p>

      <div className="map-container">
        <img src="/assets/tdtu_mapv1.png" alt="Sơ đồ tổng quát TDTU" className="map-image" />
      </div>

      {/* 2 Location Details Cards below the map */}
      <div className="map-info-cards-grid">
        <div className="map-info-card">
          <div className="map-info-icon-wrap">📍</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">Địa điểm chính thức</h4>
            <p className="map-info-card-desc">
              Hội trường lớn Tòa nhà A, Trường Đại học Tôn Đức Thắng.
            </p>
          </div>
        </div>

        <div className="map-info-card">
          <div className="map-info-icon-wrap">🛵</div>
          <div className="map-info-content">
            <h4 className="map-info-card-title">Cổng vào & Gửi xe</h4>
            <p className="map-info-card-desc">
              Các bạn đi vào bằng <strong>Cổng 7</strong> hoặc <strong>Cổng 5</strong> (Đường D6). Gửi xe máy tại tầng hầm Nhà Thi Đấu (kế bên sân bóng đá) hoặc tầng hầm Tòa nhà F, D, L.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
