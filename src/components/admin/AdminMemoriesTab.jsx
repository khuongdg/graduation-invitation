'use client';

import React from 'react';
import { formatImageUrl } from '@/utils/image';

export default function AdminMemoriesTab({
  mName,
  setMName,
  mCaption,
  setMCaption,
  mFiles,
  mPreviews,
  mSubmitting,
  mMessage,
  handleMFileChange,
  handleMClearFiles,
  handleMRemovePreview,
  handleMemorySubmit,
  memLoading,
  memories,
  currentMemories,
  handleMemoryDelete,
  setSelectedPhoto,
  totalMPages,
  mCurrentPage,
  setMCurrentPage
}) {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#E11D48', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Quản lý Ảnh Memory Wall
        </h1>
      </div>

      {/* Memory Upload Form */}
      <div className="admin-form-card" style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '40px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ➕ Thêm Ảnh & Lời Chúc
        </h3>

        {mMessage && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#059669',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            {mMessage}
          </div>
        )}

        <form onSubmit={handleMemorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>
              Tên người gửi / Bạn bè <span style={{ color: '#64748B', fontWeight: 'normal', fontSize: '0.8rem' }}>(Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={mName}
              onChange={(e) => setMName(e.target.value)}
              placeholder="Ví dụ: Hội bạn thân cử nhân"
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
              Lời chúc / Kỷ niệm đẹp <span style={{ color: '#64748B', fontWeight: 'normal', fontSize: '0.8rem' }}>(Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={mCaption}
              onChange={(e) => setMCaption(e.target.value)}
              placeholder="Ví dụ: Chúc Khương thành công rực rỡ trên hành trình mới!"
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
              Chọn tập tin ảnh kỷ niệm <span style={{ color: '#E11D48', fontWeight: 'bold' }}>(Có thể chọn nhiều ảnh cùng lúc)</span>
            </label>
            <input
              id="memory-file-input"
              type="file"
              accept="image/*"
              multiple
              required={mFiles.length === 0}
              onChange={handleMFileChange}
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
            {mPreviews.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#E11D48', marginBottom: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Xem trước ({mPreviews.length} ảnh đã chọn):</span>
                  <button
                    type="button"
                    onClick={handleMClearFiles}
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
                    ✕ Xóa tất cả {mPreviews.length} ảnh
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '12px'
                }}>
                  {mPreviews.map((url, idx) => (
                    <div key={idx} style={{
                      height: '130px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #FDA4AF',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                      background: '#000'
                    }}>
                      <img
                        src={url}
                        alt={`Preview Memory ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleMRemovePreview(idx)}
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
                      {(mName || mCaption) && (
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
                          <div style={{ fontWeight: '600', color: '#FFF', fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            💌 {mName || 'Bạn bè'}
                          </div>
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
            disabled={mSubmitting}
            style={{
              marginTop: '10px',
              padding: '14px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7, #7C3AED)',
              color: '#FFF',
              border: 'none',
              fontWeight: 'bold',
              cursor: mSubmitting ? 'wait' : 'pointer',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
            }}
          >
            {mSubmitting ? 'Đang tải lên...' : '🚀 Thêm vào Section 5'}
          </button>
        </form>
      </div>

      {/* Memories List */}
      <div>
        <div className="admin-list-header">
          <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Danh sách ảnh kỷ niệm hiện tại ({memories.length})
          </h3>
        </div>

        {memLoading ? (
          <p style={{ color: '#64748B' }}>Đang tải cuộn phim kỷ niệm...</p>
        ) : memories.length === 0 ? (
          <p style={{ color: '#64748B' }}>Chưa có ảnh kỷ niệm nào.</p>
        ) : (
          <>
            <div className="admin-photos-grid">
              {currentMemories.map((m, idx) => (
                <div key={m.id ? `mem-${m.id}-${idx}` : `mem-idx-${idx}`} style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Image Preview & Overlay Info */}
                  <div
                    onClick={() => setSelectedPhoto(m)}
                    title="Click để xem chi tiết"
                    style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', cursor: 'pointer' }}
                  >
                    {Boolean(m.imageUrl || m.image) ? (
                      <>
                        <img
                          src={formatImageUrl(m.imageUrl || m.image)}
                          alt={m.name || m.title || 'Kỷ niệm'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {(m.name || m.title || m.caption) && (
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
                            {(m.name || m.title) && (
                              <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.98rem', textShadow: '0 2px 4px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                💌 {m.name || m.title}
                              </div>
                            )}
                            {m.caption && (
                              <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.8rem', marginTop: (m.name || m.title) ? '3px' : '0px', textShadow: '0 1px 3px rgba(0,0,0,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                “{m.caption}”
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(145deg, #FFFDF9 0%, #F5E8D4 50%, #E9D5B5 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>💌</span>
                        <span style={{ fontWeight: '700', color: '#3D2614', fontSize: '0.95rem', marginTop: '6px' }}>
                          {m.name || m.title || 'Lời chúc'}
                        </span>
                        <p style={{ color: '#5C4331', fontSize: '0.8rem', fontStyle: 'italic', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>
                          “{m.caption || ''}”
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions: Delete Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <button
                      onClick={() => handleMemoryDelete(m.id, m.imageUrl || m.image)}
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
                  </div>
                </div>
              ))}
            </div>

            {/* Section 5 Pagination Controls */}
            {totalMPages > 1 && (
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
                  disabled={mCurrentPage === 1}
                  onClick={() => setMCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: mCurrentPage === 1 ? '#F1F5F9' : '#FFE4E6',
                    border: mCurrentPage === 1 ? '1px solid #E2E8F0' : '1px solid #FB7185',
                    color: mCurrentPage === 1 ? '#94A3B8' : '#E11D48',
                    cursor: mCurrentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}
                >
                  «
                </button>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {Array.from({ length: totalMPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setMCurrentPage(pageNum)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: pageNum === mCurrentPage ? 'linear-gradient(135deg, #E11D48, #9333EA)' : '#F1F5F9',
                        border: pageNum === mCurrentPage ? 'none' : '1px solid #CBD5E1',
                        color: pageNum === mCurrentPage ? '#FFF' : '#475569',
                        fontWeight: pageNum === mCurrentPage ? 'bold' : 'normal',
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
                  disabled={mCurrentPage === totalMPages}
                  onClick={() => setMCurrentPage((prev) => Math.min(prev + 1, totalMPages))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: mCurrentPage === totalMPages ? '#F1F5F9' : '#FFE4E6',
                    border: mCurrentPage === totalMPages ? '1px solid #E2E8F0' : '1px solid #FB7185',
                    color: mCurrentPage === totalMPages ? '#94A3B8' : '#E11D48',
                    cursor: mCurrentPage === totalMPages ? 'not-allowed' : 'pointer',
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
