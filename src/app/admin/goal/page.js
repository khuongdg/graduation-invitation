'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminGoalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Menu Tab State
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'memories'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Section 2 (My Journey) State
  const [journeyPhotos, setJourneyPhotos] = useState([]);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [jTitle, setJTitle] = useState('');
  const [jCaption, setJCaption] = useState('');
  const [jFiles, setJFiles] = useState([]);
  const [jPreviews, setJPreviews] = useState([]);
  const [jSubmitting, setJSubmitting] = useState(false);
  const [jMessage, setJMessage] = useState('');
  const [jCurrentPage, setJCurrentPage] = useState(1);

  // Section 5 (Memory Wall / Bạn bè) State
  const [memories, setMemories] = useState([]);
  const [memLoading, setMemLoading] = useState(true);
  const [mName, setMName] = useState('');
  const [mCaption, setMCaption] = useState('');
  const [mFiles, setMFiles] = useState([]);
  const [mPreviews, setMPreviews] = useState([]);
  const [mSubmitting, setMSubmitting] = useState(false);
  const [mMessage, setMMessage] = useState('');
  const [mCurrentPage, setMCurrentPage] = useState(1);

  // Photo Detail Lightbox Popup State
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const ITEMS_PER_PAGE = 12;

  // File Preview Handlers
  const handleJFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setJFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
      setJPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleJClearFiles = () => {
    setJFiles([]);
    setJPreviews([]);
    if (typeof document !== 'undefined') {
      const input = document.getElementById('journey-file-input');
      if (input) input.value = '';
    }
  };

  const handleJRemovePreview = (index) => {
    const newFiles = jFiles.filter((_, i) => i !== index);
    const newPreviews = jPreviews.filter((_, i) => i !== index);
    setJFiles(newFiles);
    setJPreviews(newPreviews);
    if (newFiles.length === 0 && typeof document !== 'undefined') {
      const input = document.getElementById('journey-file-input');
      if (input) input.value = '';
    }
  };

  const handleMFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setMFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
      setMPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleMClearFiles = () => {
    setMFiles([]);
    setMPreviews([]);
    if (typeof document !== 'undefined') {
      const input = document.getElementById('memory-file-input');
      if (input) input.value = '';
    }
  };

  const handleMRemovePreview = (index) => {
    const newFiles = mFiles.filter((_, i) => i !== index);
    const newPreviews = mPreviews.filter((_, i) => i !== index);
    setMFiles(newFiles);
    setMPreviews(newPreviews);
    if (newFiles.length === 0 && typeof document !== 'undefined') {
      const input = document.getElementById('memory-file-input');
      if (input) input.value = '';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthSession = sessionStorage.getItem('admin_authenticated') === 'true';
      const isAuthLocal = localStorage.getItem('admin_authenticated') === 'true';
      if (isAuthSession || isAuthLocal) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const validPasswords = ['admin', '123456', 'khuong2026', 'khuong', 'admin123'];
    if (validPasswords.includes(passwordInput.trim().toLowerCase())) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_authenticated', 'true');
      }
      setIsAuthenticated(true);
    } else {
      setAuthError('Mật khẩu không đúng! Vui lòng thử lại.');
    }
  };

  // Fetch Section 2 Journey Photos
  const fetchJourneyPhotos = async () => {
    try {
      setJourneyLoading(true);
      const res = await fetch(`/api/journey?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setJourneyPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Failed to fetch journey photos:', err);
    } finally {
      setJourneyLoading(false);
    }
  };

  // Fetch Section 5 Memories
  const fetchMemories = async () => {
    try {
      setMemLoading(true);
      const res = await fetch(`/api/memories?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories || []);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setMemLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJourneyPhotos();
      fetchMemories();
    }
  }, [isAuthenticated]);

  // Submit Journey Photo
  const handleJourneySubmit = async (e) => {
    e.preventDefault();
    if (!jFiles || jFiles.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tập tin ảnh để tải lên!');
      return;
    }

    setJSubmitting(true);
    setJMessage('');

    try {
      const formData = new FormData();
      jFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('title', jTitle || '');
      formData.append('caption', jCaption || '');

      const res = await fetch(`/api/journey?t=${Date.now()}`, {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      const data = await res.json();
      if (data.success) {
        setJMessage(`✨ Đã thêm ${jFiles.length} ảnh vào Section 2 (My Journey) thành công!`);
        setJTitle('');
        setJCaption('');
        setJFiles([]);
        setJPreviews([]);
        if (typeof document !== 'undefined') {
          const input = document.getElementById('journey-file-input');
          if (input) input.value = '';
        }
        setJourneyPhotos(data.photos || []);
      } else {
        alert(data.message || 'Tải ảnh thất bại!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setJSubmitting(false);
    }
  };

  // Delete Journey Photo
  const handleJourneyDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi Section 2?')) return;
    try {
      const res = await fetch(`/api/journey?id=${id}&t=${Date.now()}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setJourneyPhotos(data.photos || []);
      } else {
        alert(data.message || 'Xóa ảnh thất bại!');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Toggle Star (Featured status) for Section 2 Photo
  const handleToggleStar = async (id, currentStatus) => {
    const featuredCount = journeyPhotos.filter((p) => p.isFeatured).length;

    if (!currentStatus && featuredCount >= 5) {
      alert('⚠️ Bạn chỉ được chọn tối đa 5 ảnh đại diện (gắn 5 sao) để hiển thị ngoài Section 2!');
      return;
    }

    try {
      const res = await fetch(`/api/journey?t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFeatured: !currentStatus }),
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setJourneyPhotos(data.photos || []);
      } else {
        alert(data.message || 'Cập nhật thất bại!');
      }
    } catch (err) {
      console.error('Toggle star error:', err);
    }
  };

  // Submit Memory Wall Photo
  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    if (!mFiles || mFiles.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh để tải lên!');
      return;
    }

    setMSubmitting(true);
    setMMessage('');

    try {
      const formData = new FormData();
      mFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('name', mName || 'Người bạn thân');
      formData.append('caption', mCaption || 'Kỷ niệm ngày chụp ảnh tốt nghiệp!');

      const res = await fetch('/api/memories', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMMessage(`✨ Đã thêm ${mFiles.length} ảnh vào Section 5 (Memory Wall) thành công!`);
        setMName('');
        setMCaption('');
        setMFiles([]);
        setMPreviews([]);
        if (typeof document !== 'undefined') {
          const input = document.getElementById('memory-file-input');
          if (input) input.value = '';
        }
        setMemories(data.memories || []);
      } else {
        alert(data.message || 'Tải ảnh lên thất bại!');
      }
    } catch (err) {
      console.error('Upload memory error:', err);
      alert('Lỗi kết nối máy chủ khi tải ảnh!');
    } finally {
      setMSubmitting(false);
    }
  };

  // Delete Memory Wall Photo
  const handleMemoryDelete = async (id, imageUrl) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh kỷ niệm này khỏi Section 5?')) return;
    try {
      const url = `/api/memories?id=${encodeURIComponent(id || '')}&imageUrl=${encodeURIComponent(imageUrl || '')}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.memories) {
        setMemories(data.memories);
      } else {
        alert(data.message || 'Chưa xóa được ảnh trên Google Sheets! Vui lòng kiểm tra lại Google Apps Script.');
        fetchMemories();
      }
    } catch (err) {
      console.error('Delete memory error:', err);
      alert('Lỗi kết nối khi xóa ảnh!');
      fetchMemories();
    }
  };

  const featuredJourneyCount = journeyPhotos.filter((p) => p.isFeatured).length;

  // Section 2 Pagination Logic
  const totalJPages = Math.ceil(journeyPhotos.length / ITEMS_PER_PAGE) || 1;
  const currentJPhotos = journeyPhotos.slice(
    (jCurrentPage - 1) * ITEMS_PER_PAGE,
    jCurrentPage * ITEMS_PER_PAGE
  );

  // Section 5 Pagination Logic
  const totalMPages = Math.ceil(memories.length / ITEMS_PER_PAGE) || 1;
  const currentMemories = memories.slice(
    (mCurrentPage - 1) * ITEMS_PER_PAGE,
    mCurrentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (jCurrentPage > totalJPages) {
      setJCurrentPage(totalJPages);
    }
  }, [journeyPhotos.length, totalJPages, jCurrentPage]);

  useEffect(() => {
    if (mCurrentPage > totalMPages) {
      setMCurrentPage(totalMPages);
    }
  }, [memories.length, totalMPages, mCurrentPage]);

  // Render Login Prompt if Not Authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#060711',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#00F0FF' }}>Đăng Nhập Admin</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '6px', marginBottom: '24px' }}>
            Vui lòng nhập mật khẩu quản trị để mở trang Admin Dashboard
          </p>

          {authError && (
            <div style={{
              background: 'rgba(255, 42, 85, 0.18)',
              border: '1px solid #FF2A55',
              color: '#FF6B8B',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              required
              autoFocus
              placeholder="Nhập mật khẩu..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F0FF, #7000FF)',
                color: '#FFF',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Đăng Nhập 🚀
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Mobile Sticky Bar with Left Hamburger Menu Button */}
      <div className="admin-mobile-top-bar">
        <button
          type="button"
          className="admin-mobile-toggle-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{isMobileMenuOpen ? '✕' : '☰'}</span>
          <span>{isMobileMenuOpen ? 'Đóng Menu' : 'Menu Quản Trị'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#00F0FF', fontWeight: '700' }}>
          <span>⚙️</span>
          <span>{activeTab === 'journey' ? 'Section 2 (My Journey)' : 'Section 5 (Memory Wall)'}</span>
        </div>
      </div>

      {/* Mobile Menu Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ==========================================================================
         LEFT NAVIGATION SIDEBAR MENU (Collapsible on mobile)
         ========================================================================== */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          {/* Dashboard Header */}
          <div className="admin-sidebar-header" style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>⚙️</span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#00F0FF', fontWeight: 700 }}>
                Admin Dashboard
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Quản trị Lễ Tốt Nghiệp TDTU
            </p>
          </div>

          {/* Navigation Items */}
          <div className="admin-nav-group">
            <button
              onClick={() => {
                setActiveTab('journey');
                setIsMobileMenuOpen(false);
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="admin-nav-button"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: activeTab === 'journey' ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'journey' ? 'linear-gradient(135deg, rgba(0,240,255,0.18), rgba(112,0,255,0.18))' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'journey' ? '#00F0FF' : 'rgba(255,255,255,0.75)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'journey' ? '0 4px 20px rgba(0, 240, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📸</span> My Journey (Section 2)
              </div>
              <div style={{ fontSize: '0.78rem', color: activeTab === 'journey' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Chọn 5 ảnh đại diện (Gắn sao ⭐)
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('memories');
                setIsMobileMenuOpen(false);
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="admin-nav-button"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '14px',
                border: activeTab === 'memories' ? '1px solid #FF2A55' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === 'memories' ? 'linear-gradient(135deg, rgba(255,42,85,0.18), rgba(147,51,234,0.18))' : 'rgba(255,255,255,0.03)',
                color: activeTab === 'memories' ? '#FF6B8B' : 'rgba(255,255,255,0.75)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'memories' ? '0 4px 20px rgba(255, 42, 85, 0.25)' : 'none'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎞️</span> Memory Wall (Section 5)
              </div>
              <div style={{ fontSize: '0.78rem', color: activeTab === 'memories' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Quản lý ảnh & lời chúc với bạn bè
              </div>
            </button>
          </div>
        </div>

        {/* Back to Website Button */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              textDecoration: 'none',
              fontSize: '0.9rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* ==========================================================================
         MAIN CONTENT WORKSPACE AREA
         ========================================================================== */}
      <main className="admin-main-workspace">
        <div style={{ maxWidth: '1200px', width: '100%' }}>
          {/* TAB 1: SECTION 02 MY JOURNEY MANAGEMENT */}
          {activeTab === 'journey' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Quản lý Ảnh Section My Journey at TDTU
                </h1>
                {/* <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '0.95rem' }}>
                  Tick chọn tối đa **5 ngôi sao ⭐** dưới mỗi góc phải ảnh để hiển thị làm 5 ảnh đại diện trong khung collage Section 02!
                </p> */}
              </div>

              {/* Upload Form Card */}
              <div className="admin-form-card" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#FF3B5C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ➕ Thêm Ảnh Mới
                </h3>

                {jMessage && (
                  <div style={{
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid #00F0FF',
                    color: '#00F0FF',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    {jMessage}
                  </div>
                )}

                <form onSubmit={handleJourneySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Tiêu đề ảnh / Tên kỷ niệm <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn - Không bắt buộc)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Mô tả ngắn <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn - Không bắt buộc)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Chọn tập tin ảnh (JPG / PNG / WEBP) <span style={{ color: '#00F0FF', fontWeight: 'bold' }}>(Có thể chọn nhiều ảnh cùng lúc)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />

                    {/* Multiple Image Previews Grid for Section 2 */}
                    {jPreviews.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#00F0FF', marginBottom: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>Xem trước ({jPreviews.length} ảnh đã chọn):</span>
                          <button
                            type="button"
                            onClick={handleJClearFiles}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #EF4444',
                              color: '#F87171',
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
                              border: '1px solid rgba(0, 240, 255, 0.5)',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
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
                      background: 'linear-gradient(135deg, #FF3B5C, #9333EA)',
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: jSubmitting ? 'wait' : 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(255, 59, 92, 0.4)'
                    }}
                  >
                    {jSubmitting ? 'Đang tải lên...' : '🚀 Thêm vào Section 2'}
                  </button>
                </form>
              </div>

              {/* Photos List */}
              <div>
                <div className="admin-list-header">
                  <h3 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Danh sách ảnh hiện tại ({journeyPhotos.length})
                  </h3>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: featuredJourneyCount === 5 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    border: featuredJourneyCount === 5 ? '1px solid #FFD700' : '1px solid #00F0FF',
                    color: featuredJourneyCount === 5 ? '#FFD700' : '#00F0FF',
                    fontSize: '0.88rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    🌟 Đã chọn đại diện: {featuredJourneyCount}/5 ảnh
                  </div>
                </div>

                {journeyLoading ? (
                  <p style={{ color: '#94A3B8' }}>Đang tải danh sách ảnh...</p>
                ) : journeyPhotos.length === 0 ? (
                  <p style={{ color: '#94A3B8' }}>Chưa có ảnh nào trong Section 2.</p>
                ) : (
                  <>
                    <div className="admin-photos-grid">
                      {currentJPhotos.map((p, idx) => (
                        <div key={p.id ? `j-${p.id}-${idx}` : `j-idx-${idx}`} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '16px',
                          border: p.isFeatured ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.12)',
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: p.isFeatured ? '0 0 20px rgba(255, 215, 0, 0.25)' : 'none',
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
                              src={p.imageUrl}
                              alt={p.title || 'Kỷ niệm'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />

                            {/* Featured Star Badge */}
                            {p.isFeatured && (
                              <span style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0, 0, 0, 0.75)',
                                border: '1px solid #FFD700',
                                borderRadius: '20px',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                color: '#FFD700',
                                fontWeight: 'bold',
                                backdropFilter: 'blur(8px)',
                                zIndex: 2
                              }}>
                                ⭐ Ảnh đại diện
                              </span>
                            )}

                            {/* Title & Caption Overlay on Photo */}
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
                            background: 'rgba(251, 245, 245, 0)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                          }}>
                            <button
                              onClick={() => handleJourneyDelete(p.id)}
                              style={{
                                padding: '7px 13px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #EF4444',
                                color: '#F87171',
                                fontSize: '0.82rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              🗑️ Xóa ảnh
                            </button>

                            <button
                              onClick={() => handleToggleStar(p.id, p.isFeatured)}
                              title={p.isFeatured ? 'Bỏ chọn ảnh đại diện' : 'Chọn làm ảnh đại diện Section 2'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 13px',
                                borderRadius: '8px',
                                background: p.isFeatured ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                                border: p.isFeatured ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.2)',
                                color: p.isFeatured ? '#FFD700' : 'rgba(255, 255, 255, 0.75)',
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
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          disabled={jCurrentPage === 1}
                          onClick={() => setJCurrentPage((prev) => Math.max(prev - 1, 1))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: jCurrentPage === 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 240, 255, 0.15)',
                            border: jCurrentPage === 1 ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #00F0FF',
                            color: jCurrentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#00F0FF',
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
                                background: pageNum === jCurrentPage ? 'linear-gradient(135deg, #00F0FF, #7000FF)' : 'rgba(255, 255, 255, 0.06)',
                                border: pageNum === jCurrentPage ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                                color: pageNum === jCurrentPage ? '#FFF' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: pageNum === jCurrentPage ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: pageNum === jCurrentPage ? '0 4px 15px rgba(0, 240, 255, 0.3)' : 'none'
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
                            background: jCurrentPage === totalJPages ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 240, 255, 0.15)',
                            border: jCurrentPage === totalJPages ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #00F0FF',
                            color: jCurrentPage === totalJPages ? 'rgba(255, 255, 255, 0.3)' : '#00F0FF',
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
          )}

          {/* TAB 2: SECTION 05 MEMORY WALL (KỶ NIỆM VỚI BẠN BÈ) */}
          {activeTab === 'memories' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FF6B8B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Quản lý Ảnh Memory Wall
                </h1>
              </div>

              {/* Memory Upload Form */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ➕ Thêm Ảnh & Lời Chúc
                </h3>

                {mMessage && (
                  <div style={{
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid #00F0FF',
                    color: '#00F0FF',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    {mMessage}
                  </div>
                )}

                <form onSubmit={handleMemorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Tên người gửi / Bạn bè <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Lời chúc / Kỷ niệm đẹp <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>(Tùy chọn)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      Chọn tập tin ảnh kỷ niệm <span style={{ color: '#FF6B8B', fontWeight: 'bold' }}>(Có thể chọn nhiều ảnh cùng lúc)</span>
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFF',
                        boxSizing: 'border-box'
                      }}
                    />

                    {/* Multiple Image Previews Grid for Section 5 */}
                    {mPreviews.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#FF6B8B', marginBottom: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>Xem trước ({mPreviews.length} ảnh đã chọn):</span>
                          <button
                            type="button"
                            onClick={handleMClearFiles}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #EF4444',
                              color: '#F87171',
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
                              border: '1px solid rgba(255, 107, 139, 0.5)',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
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
                      background: 'linear-gradient(135deg, #00F0FF, #7000FF)',
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: mSubmitting ? 'wait' : 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)'
                    }}
                  >
                    {mSubmitting ? 'Đang tải lên Cloudinary...' : '🚀 Thêm vào Section 5'}
                  </button>
                </form>
              </div>

              {/* Memories List */}
              <div>
                <div className="admin-list-header">
                  <h3 style={{ fontSize: '1.25rem', color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Danh sách ảnh kỷ niệm hiện tại ({memories.length})
                  </h3>
                </div>

                {memLoading ? (
                  <p style={{ color: '#94A3B8' }}>Đang tải cuộn phim kỷ niệm...</p>
                ) : memories.length === 0 ? (
                  <p style={{ color: '#94A3B8' }}>Chưa có ảnh kỷ niệm nào.</p>
                ) : (
                  <>
                    <div className="admin-photos-grid">
                      {currentMemories.map((m, idx) => (
                        <div key={m.id ? `mem-${m.id}-${idx}` : `mem-idx-${idx}`} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          overflow: 'hidden',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Image Preview & Overlay Info */}
                          <div
                            onClick={() => setSelectedPhoto(m)}
                            title="Click để xem ảnh chi tiết"
                            style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden', cursor: 'pointer' }}
                          >
                            <img
                              src={m.imageUrl || m.image}
                              alt={m.name || m.title || 'Kỷ niệm'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />

                            {/* Title & Caption Overlay on Photo */}
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
                          </div>

                          {/* Card Actions: Delete Button */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 14px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                          }}>
                            <button
                              onClick={() => handleMemoryDelete(m.id, m.imageUrl || m.image)}
                              style={{
                                padding: '7px 13px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #EF4444',
                                color: '#F87171',
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
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          disabled={mCurrentPage === 1}
                          onClick={() => setMCurrentPage((prev) => Math.max(prev - 1, 1))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: mCurrentPage === 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 42, 85, 0.15)',
                            border: mCurrentPage === 1 ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #FF2A55',
                            color: mCurrentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#FF6B8B',
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
                                background: pageNum === mCurrentPage ? 'linear-gradient(135deg, #FF2A55, #9333EA)' : 'rgba(255, 255, 255, 0.06)',
                                border: pageNum === mCurrentPage ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                                color: pageNum === mCurrentPage ? '#FFF' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: pageNum === mCurrentPage ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: pageNum === mCurrentPage ? '0 4px 15px rgba(255, 42, 85, 0.3)' : 'none'
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
                            background: mCurrentPage === totalMPages ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 42, 85, 0.15)',
                            border: mCurrentPage === totalMPages ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #FF2A55',
                            color: mCurrentPage === totalMPages ? 'rgba(255, 255, 255, 0.3)' : '#FF6B8B',
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
          )}
        </div>
      </main>

      {/* Photo Lightbox Popup Modal for Admin */}
      {selectedPhoto && (
        <div className="glass-modal-overlay open" onClick={() => setSelectedPhoto(null)} style={{ zIndex: 10000 }}>
          <div className="glass-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '92%' }}>
            <button className="modal-close-icon" onClick={() => setSelectedPhoto(null)}>✕</button>
            <div style={{
              width: '100%',
              maxHeight: '65vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.25)'
            }}>
              <img
                src={selectedPhoto.imageUrl || selectedPhoto.image}
                alt={selectedPhoto.name || selectedPhoto.title || 'Kỷ niệm'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  display: 'block'
                }}
              />
            </div>
            {(selectedPhoto.name || selectedPhoto.title || selectedPhoto.caption) && (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                {(selectedPhoto.name || selectedPhoto.title) && (
                  <h4 style={{ margin: 0, color: '#FFF', fontSize: '1.2rem', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💌</span>
                    <span>{selectedPhoto.name || selectedPhoto.title}</span>
                  </h4>
                )}
                {selectedPhoto.caption && (
                  <p className="lightbox-photo-caption" style={{ marginTop: (selectedPhoto.name || selectedPhoto.title) ? '6px' : '0px', color: 'rgba(255, 255, 255, 0.85)', fontStyle: 'italic' }}>
                    “{selectedPhoto.caption}”
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
