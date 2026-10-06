'use client';

import React from 'react';
import { formatImageUrl } from '@/utils/image';

export default function AdminJourneyTab({
  jTitle,
  setJTitle,
  jCaption,
  setJCaption,
  jFiles,
  jPreviews,
  jSubmitting,
  jMessage,
  handleJFileChange,
  handleJClearFiles,
  handleJRemovePreview,
  handleJourneySubmit,
  journeyLoading,
  journeyPhotos,
  currentJPhotos,
  featuredJourneyCount,
  handleJourneyDelete,
  handleToggleStar,
  setSelectedPhoto,
  totalJPages,
  jCurrentPage,
  setJCurrentPage
}) {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Quản lý Ảnh Section My Journey at TDTU
        </h1>
      </div>

      {/* Upload Form Card */}
      <div className="admin-form-card" style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '40px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ➕ Thêm Ảnh Mới
        </h3>

        {jMessage && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            {jMessage}
          </div>
        )}

        <form onSubmit={handleJourneySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
              Tiêu đề ảnh / Tên kỷ niệm <span style={{ color: '#64748B', fontWeight: 'normal', fontSize: '0.8rem' }}>(Tùy chọn - Không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={jTitle}
              onChange={(e) => setJTitle(e.target.value)}
              placeholder="Ví dụ: Lễ Tốt Nghiệp TDTU (Có thể để trống)"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
              Mô tả ngắn <span style={{ color: '#64748B', fontWeight: 'normal', fontSize: '0.8rem' }}>(Tùy chọn - Không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={jCaption}
              onChange={(e) => setJCaption(e.target.value)}
              placeholder="Ví dụ: Kỷ niệm rực rỡ thời sinh viên (Có thể để trống)"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
              Chọn tập tin ảnh (JPG / PNG / WEBP) <span style={{ color: '#0284C7', fontWeight: 'bold' }}>(Có thể chọn nhiều ảnh cùng lúc)</span>
            </label>
            <input
              id="journey-file-input"
              type="file"
              accept="image/*"
              multiple
              required={jFiles.length === 0}
              onChange={handleJFileChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                boxSizing: 'border-box'
              }}
            />

            {/* Multiple Image Previews Grid */}
            {jPreviews.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#0284C7', marginBottom: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Xem trước ({jPreviews.length} ảnh đã chọn):</span>
                  <button
                    type="button"
                    onClick={handleJClearFiles}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#DC2626',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Xóa tất cả {jPreviews.length} ảnh
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '12px'
                }}>
                  {jPreviews.map((url, idx) => (
                    <div key={idx} style={{
                      height: '130px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #38BDF8',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                      background: '#000'
                    }}>
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleJRemovePreview(idx)}
                        title="Xóa ảnh này"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#FF6B8B',
                          border: '1px solid #FF6B8B',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 3
                        }}
                      >
                        ✕
                      </button>
                      {(jTitle || jCaption) && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '16px 6px 4px 6px',
                          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}>
                          {jTitle && (
                            <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {jFiles.length > 1 ? `${jTitle} (${idx + 1})` : jTitle}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={jSubmitting}
            style={{
              marginTop: '10px',
              padding: '14px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7, #7C3AED)',
              color: '#FFF',
              border: 'none',
              fontWeight: 'bold',
              cursor: jSubmitting ? 'wait' : 'pointer',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
            }}
          >
            {jSubmitting ? 'Đang tải lên...' : '🚀 Thêm vào Section 2'}
          </button>
        </form>
      </div>

      {/* Photos List */}
      <div>
        <div className="admin-list-header">
          <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Danh sách ảnh hiện tại ({journeyPhotos.length})
          </h3>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '20px',
            background: featuredJourneyCount === 5 ? '#FEF3C7' : '#E0F2FE',
            border: featuredJourneyCount === 5 ? '1px solid #FCD34D' : '1px solid #BAE6FD',
            color: featuredJourneyCount === 5 ? '#B45309' : '#0284C7',
            fontSize: '0.88rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            🌟 Đã chọn đại diện: {featuredJourneyCount}/5 ảnh
          </div>
        </div>

        {journeyLoading ? (
          <p style={{ color: '#64748B' }}>Đang tải danh sách ảnh...</p>
        ) : journeyPhotos.length === 0 ? (
          <p style={{ color: '#64748B' }}>Chưa có ảnh nào trong Section 2.</p>
        ) : (
          <>
            <div className="admin-photos-grid">
              {currentJPhotos.map((p, idx) => (
                <div key={p.id ? `j-${p.id}-${idx}` : `j-idx-${idx}`} style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: p.isFeatured ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: p.isFeatured ? '0 0 20px rgba(245, 158, 11, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Image Preview & Overlay Info */}
                  <div
                    onClick={() => setSelectedPhoto(p)}
                    title="Click để xem ảnh chi tiết"
                    style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <img
                      src={formatImageUrl(p.imageUrl || p.image)}
                      alt={p.title || 'Kỷ niệm'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />

                    {p.isFeatured && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 215, 0, 0.95)',
                        border: '1px solid #F59E0B',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        color: '#78350F',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(8px)',
                        zIndex: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        ⭐ Ảnh đại diện
                      </span>
                    )}

                    {(p.title || p.caption) && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '30px 14px 12px 14px',
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}>
                        {p.title && (
                          <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.98rem', textShadow: '0 2px 4px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                        )}
                        {p.caption && (
                          <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8rem', marginTop: p.title ? '3px' : '0px', textShadow: '0 1px 3px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.caption}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions: Delete & Star Toggle Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <button
                      onClick={() => handleJourneyDelete(p.id, p.imageUrl)}
                      style={{
                        padding: '7px 13px',
                        borderRadius: '8px',
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        fontSize: '0.82rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🗑️ Xóa ảnh
                    </button>

                    <button
                      onClick={() => handleToggleStar(p.id, p.isFeatured, p.imageUrl)}
                      title={p.isFeatured ? 'Bỏ chọn ảnh đại diện' : 'Chọn làm ảnh đại diện Section 2'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        background: p.isFeatured ? '#FEF3C7' : '#F1F5F9',
                        border: p.isFeatured ? '1px solid #FCD34D' : '1px solid #CBD5E1',
                        color: p.isFeatured ? '#B45309' : '#475569',
                        fontSize: '0.82rem',
                        fontWeight: p.isFeatured ? 'bold' : 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>
                        {p.isFeatured ? '⭐' : '✩'}
                      </span>
                      <span>{p.isFeatured ? 'Đã tick' : 'Gắn sao'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2 Pagination Controls */}
            {totalJPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '32px',
                padding: '16px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                flexWrap: 'wrap'
              }}>
                <button
                  disabled={jCurrentPage === 1}
                  onClick={() => setJCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: jCurrentPage === 1 ? '#F1F5F9' : '#E0F2FE',
                    border: jCurrentPage === 1 ? '1px solid #E2E8F0' : '1px solid #0284C7',
                    color: jCurrentPage === 1 ? '#94A3B8' : '#0284C7',
                    cursor: jCurrentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}
                >
                  «
                </button>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {Array.from({ length: totalJPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setJCurrentPage(pageNum)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: pageNum === jCurrentPage ? 'linear-gradient(135deg, #0284C7, #7C3AED)' : '#F1F5F9',
                        border: pageNum === jCurrentPage ? 'none' : '1px solid #CBD5E1',
                        color: pageNum === jCurrentPage ? '#FFF' : '#475569',
                        fontWeight: pageNum === jCurrentPage ? 'bold' : 'normal',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  disabled={jCurrentPage === totalJPages}
                  onClick={() => setJCurrentPage((prev) => Math.min(prev + 1, totalJPages))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: jCurrentPage === totalJPages ? '#F1F5F9' : '#E0F2FE',
                    border: jCurrentPage === totalJPages ? '1px solid #E2E8F0' : '1px solid #0284C7',
                    color: jCurrentPage === totalJPages ? '#94A3B8' : '#0284C7',
                    cursor: jCurrentPage === totalJPages ? 'not-allowed' : 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
