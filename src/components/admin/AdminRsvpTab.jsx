'use client';

import React from 'react';

export default function AdminRsvpTab({
  rsvps,
  rsvpLoading,
  checkIsAttending,
  rsvpSearch,
  setRsvpSearch,
  rsvpFilterStatus,
  setRsvpFilterStatus,
  handleExportCsv,
  filteredRsvps,
  handleDeleteRsvp,
  rCurrentPage,
  setRCurrentPage
}) {
  const [pageSize, setPageSize] = React.useState(10);

  const actualPageSize = pageSize === 'ALL' ? (filteredRsvps.length || 1) : Number(pageSize);
  const totalPages = Math.ceil(filteredRsvps.length / actualPageSize) || 1;
  const currentPageSafe = Math.min(Math.max(1, rCurrentPage), totalPages);

  const startIndex = (currentPageSafe - 1) * actualPageSize;
  const endIndex = Math.min(startIndex + actualPageSize, filteredRsvps.length);
  const displayRsvps = pageSize === 'ALL'
    ? filteredRsvps
    : filteredRsvps.slice(startIndex, startIndex + actualPageSize);

  return (
    <div className="admin-content-section">
      {/* Header Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Tổng khách mời</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{rsvps.length}</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Xác nhận tham gia</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>
            {rsvps.filter(r => checkIsAttending(r.status)).length}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Không thể tham dự</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#E11D48', marginTop: '4px' }}>
            {rsvps.filter(r => !checkIsAttending(r.status)).length}
          </div>
        </div>
      </div>

      {/* Action Toolbar: Search, Filter, Export */}
      <div className="admin-rsvp-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-rsvp-toolbar-left" style={{ display: 'flex', gap: '12px', flex: '1 1 300px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, SĐT, Email..."
            value={rsvpSearch}
            onChange={(e) => { setRsvpSearch(e.target.value); setRCurrentPage(1); }}
            className="admin-rsvp-search-input"
            style={{
              flex: '1 1 200px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '0.92rem',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              minWidth: '0'
            }}
          />

          <select
            value={rsvpFilterStatus}
            onChange={(e) => { setRsvpFilterStatus(e.target.value); setRCurrentPage(1); }}
            className="admin-rsvp-filter-select"
            style={{
              padding: '12px 38px 12px 16px',
              borderRadius: '12px',
              background: '#FFFFFF',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230F172A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              backgroundSize: '15px',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              fontSize: '0.92rem',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              minWidth: '175px'
            }}
          >
            <option value="ALL" style={{ background: '#FFFFFF', color: '#0F172A' }}>Tất cả trạng thái</option>
            <option value="ATTENDING" style={{ background: '#FFFFFF', color: '#059669' }}>Xác nhận tham gia</option>
            <option value="DECLINED" style={{ background: '#FFFFFF', color: '#DC2626' }}>Không thể tham dự</option>
          </select>
        </div>

        <button
          onClick={handleExportCsv}
          className="admin-rsvp-export-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 22px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.92rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          📥 Xuất Excel / CSV ({filteredRsvps.length})
        </button>
      </div>

      {/* Guest List Table & Mobile Cards Container */}
      <div className="admin-list-card" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid #CBD5E1', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', margin: '0 0 18px 0' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#0F172A', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📩 Danh sách khách mời ({filteredRsvps.length})
          </h3>

          {/* Items Per Page Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: '600' }}>
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setRCurrentPage(1);
              }}
              style={{
                padding: '7px 34px 7px 14px',
                borderRadius: '10px',
                background: '#FFFFFF',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230F172A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '13px',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value="ALL">Tất cả ({filteredRsvps.length})</option>
            </select>
          </div>
        </div>

        {rsvpLoading ? (
          <p style={{ color: '#64748B', fontWeight: '500' }}>Đang tải danh sách khách mời...</p>
        ) : filteredRsvps.length === 0 ? (
          <p style={{ color: '#64748B', fontWeight: '500' }}>Không tìm thấy khách mời nào.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-desktop-table-view">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '640px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>STT</th>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRsvps.map((r, idx) => {
                    const isAttending = checkIsAttending(r.status);
                    const stt = startIndex + idx + 1;
                    return (
                      <tr key={r.id ? `rsvp-${r.id}-${idx}` : `rsvp-idx-${idx}`} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 10px', color: '#64748B', fontSize: '0.88rem', fontWeight: '600' }}>
                          {stt}
                        </td>
                        <td style={{ padding: '14px 10px', fontWeight: '700', color: '#0F172A', fontSize: '0.98rem' }}>
                          {r.name || 'Khách mời'}
                        </td>
                        <td style={{ padding: '14px 10px', color: '#0284C7', fontSize: '0.92rem' }}>
                          {r.phone ? (
                            <a href={`tel:${r.phone}`} style={{ color: '#0284C7', textDecoration: 'none', fontWeight: '600' }}>
                              {r.phone}
                            </a>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '14px 10px', color: '#334155', fontSize: '0.9rem', fontWeight: '500' }}>
                          {r.email ? (
                            <a href={`mailto:${r.email}`} style={{ color: '#334155', textDecoration: 'none' }}>
                              {r.email}
                            </a>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <span style={{
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            background: isAttending ? '#ECFDF5' : '#FEF2F2',
                            color: isAttending ? '#047857' : '#B91C1C',
                            border: isAttending ? '1px solid #6EE7B7' : '1px solid #FCA5A5'
                          }}>
                            {isAttending ? '✓ Xác nhận tham gia' : `✕ ${r.status || 'Không thể tham dự'}`}
                          </span>
                        </td>
                        <td style={{ padding: '14px 10px', color: '#64748B', fontSize: '0.82rem', fontWeight: '500' }}>
                          {r.timestamp || r.time || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteRsvp(r)}
                            title="Xóa khách mời"
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: '600'
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-mobile-cards-view">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayRsvps.map((r, idx) => {
                  const isAttending = checkIsAttending(r.status);
                  const stt = startIndex + idx + 1;
                  return (
                    <div
                      key={r.id ? `rsvp-card-${r.id}-${idx}` : `rsvp-card-idx-${idx}`}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                      }}
                    >
                      {/* Header: STT, Name, Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            #{stt}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0F172A' }}>
                            {r.name || 'Khách mời'}
                          </h4>
                        </div>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          background: isAttending ? '#ECFDF5' : '#FEF2F2',
                          color: isAttending ? '#047857' : '#B91C1C',
                          border: isAttending ? '1px solid #6EE7B7' : '1px solid #FCA5A5',
                          whiteSpace: 'nowrap'
                        }}>
                          {isAttending ? '✓ Tham gia' : `✕ Không tham dự`}
                        </span>
                      </div>

                      {/* Body: Contact Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                        {r.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <a href={`tel:${r.phone}`} style={{ color: '#0284C7', textDecoration: 'none', fontWeight: '600' }}>
                              {r.phone}
                            </a>
                          </div>
                        )}
                        {r.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-all' }}>
                            <a href={`mailto:${r.email}`} style={{ color: '#334155', textDecoration: 'none', fontWeight: '500' }}>
                              {r.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Footer: Timestamp & Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748B', fontWeight: '500' }}>
                          {r.timestamp || r.time || '—'}
                        </span>
                        <button
                          onClick={() => handleDeleteRsvp(r)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            color: '#DC2626',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Enhanced Pagination Controls Bar */}
        {pageSize !== 'ALL' && totalPages > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ color: '#64748B', fontSize: '0.88rem', fontWeight: '600' }}>
              Hiển thị <strong style={{ color: '#0F172A' }}>{startIndex + 1}</strong> – <strong style={{ color: '#0F172A' }}>{endIndex}</strong> trên <strong style={{ color: '#0F172A' }}>{filteredRsvps.length}</strong> khách mời
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Prev Button */}
              <button
                disabled={currentPageSafe === 1}
                onClick={() => setRCurrentPage(currentPageSafe - 1)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: currentPageSafe === 1 ? '#F1F5F9' : '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: currentPageSafe === 1 ? '#94A3B8' : '#0F172A',
                  cursor: currentPageSafe === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  boxShadow: currentPageSafe === 1 ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                ‹ Trước
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPageSafe;
                return (
                  <button
                    key={`page-num-${pageNum}`}
                    onClick={() => setRCurrentPage(pageNum)}
                    style={{
                      minWidth: '34px',
                      height: '34px',
                      padding: '0 8px',
                      borderRadius: '8px',
                      background: isActive ? '#059669' : '#FFFFFF',
                      border: isActive ? '1px solid #059669' : '1px solid #CBD5E1',
                      color: isActive ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      boxShadow: isActive ? '0 2px 8px rgba(5,150,105,0.3)' : '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                disabled={currentPageSafe === totalPages}
                onClick={() => setRCurrentPage(currentPageSafe + 1)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: currentPageSafe === totalPages ? '#F1F5F9' : '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: currentPageSafe === totalPages ? '#94A3B8' : '#0F172A',
                  cursor: currentPageSafe === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  boxShadow: currentPageSafe === totalPages ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
