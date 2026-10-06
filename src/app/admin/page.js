'use client';

import React, { useState, useEffect } from 'react';
import AdminLoginView from '@/components/admin/AdminLoginView';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminJourneyTab from '@/components/admin/AdminJourneyTab';
import AdminMemoriesTab from '@/components/admin/AdminMemoriesTab';
import AdminRsvpTab from '@/components/admin/AdminRsvpTab';
import PhotoLightboxModal from '@/components/admin/PhotoLightboxModal';

export default function AdminGoalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Menu Tab State ('journey' | 'memories' | 'rsvps')
  const [activeTab, setActiveTab] = useState('journey');
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

  // Section 3 (Guest RSVP Management) State
  const [rsvps, setRsvps] = useState([]);
  const [rsvpLoading, setRsvpLoading] = useState(true);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpFilterStatus, setRsvpFilterStatus] = useState('ALL');
  const [rCurrentPage, setRCurrentPage] = useState(1);

  // Photo Detail Lightbox Popup State
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const ITEMS_PER_PAGE = 12;

  // File Preview Handlers for Section 2
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

  // File Preview Handlers for Section 5
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

  // Fetch Guest RSVP Registrations
  const fetchRsvps = async () => {
    try {
      setRsvpLoading(true);
      const res = await fetch(`/api/register?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setRsvps(data.registrations || []);
      }
    } catch (err) {
      console.error('Failed to fetch RSVPs:', err);
    } finally {
      setRsvpLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJourneyPhotos();
      fetchMemories();
      fetchRsvps();
    }
  }, [isAuthenticated]);

  const handleDeleteRsvp = async (r) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách mời "${r.name}" khỏi danh sách?`)) return;
    try {
      const url = `/api/register?id=${encodeURIComponent(r.id || '')}&email=${encodeURIComponent(r.email || '')}&phone=${encodeURIComponent(r.phone || '')}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (data.registrations) {
          setRsvps(data.registrations);
        } else {
          fetchRsvps();
        }
      } else {
        alert(data.message || 'Xóa thất bại!');
      }
    } catch (err) {
      console.error('Delete RSVP error:', err);
      alert('Lỗi máy chủ khi xóa khách mời!');
    }
  };

  const handleExportCsv = () => {
    if (rsvps.length === 0) {
      alert('Chưa có khách mời nào trong danh sách!');
      return;
    }
    const header = ['STT', 'Họ và tên', 'Số điện thoại', 'Email', 'Trạng thái', 'Thời gian đăng ký'];
    const rows = filteredRsvps.map((r, i) => [
      i + 1,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"'${(r.phone || '').replace(/^'/, '')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.status || 'Xác nhận tham gia').replace(/"/g, '""')}"`,
      `"${(r.timestamp || r.time || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\ufeff' + header.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_Sach_Khach_Moi_Graduation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const notifySync = () => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('graduation_admin_sync');
        channel.postMessage('journey_updated');
        channel.close();
      } catch (e) { }
    }
  };

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
        notifySync();
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
  const handleJourneyDelete = async (id, imageUrl) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi Section 2?')) return;
    try {
      const url = `/api/journey?id=${encodeURIComponent(id || '')}&imageUrl=${encodeURIComponent(imageUrl || '')}&t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'DELETE',
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setJourneyPhotos(data.photos || []);
        notifySync();
      } else {
        alert(data.message || 'Xóa ảnh thất bại!');
        fetchJourneyPhotos();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Lỗi kết nối khi xóa ảnh!');
      fetchJourneyPhotos();
    }
  };

  // Toggle Star (Featured status) for Section 2 Photo
  const handleToggleStar = async (id, currentStatus, imageUrl) => {
    const featuredCount = journeyPhotos.filter((p) => p.isFeatured).length;

    if (!currentStatus && featuredCount >= 5) {
      alert('⚠️ Bạn chỉ được chọn tối đa 5 ảnh đại diện (gắn 5 sao) để hiển thị ngoài Section 2!');
      return;
    }

    try {
      const res = await fetch(`/api/journey?t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFeatured: !currentStatus, imageUrl }),
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setJourneyPhotos(data.photos || []);
        notifySync();
      } else {
        alert(data.message || 'Cập nhật thất bại!');
        fetchJourneyPhotos();
      }
    } catch (err) {
      console.error('Toggle star error:', err);
      fetchJourneyPhotos();
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

  const checkIsAttending = (statusStr) => {
    if (!statusStr) return true;
    const s = statusStr.toString().toLowerCase();
    if (s.includes('bận') || s.includes('không') || s.includes('tiếc') || s.includes('declined') || s.includes('absent')) {
      return false;
    }
    return s.includes('tham gia') || s.includes('có') || s.includes('confirm') || s.includes('attending');
  };

  // Section 3 (RSVP Guests) Filtering & Pagination Logic
  const filteredRsvps = rsvps.filter((r) => {
    const query = rsvpSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (r.name || '').toLowerCase().includes(query) ||
      (r.phone || '').includes(query) ||
      (r.email || '').toLowerCase().includes(query);

    const isAttending = checkIsAttending(r.status);

    if (rsvpFilterStatus === 'ATTENDING') return matchesSearch && isAttending;
    if (rsvpFilterStatus === 'DECLINED') return matchesSearch && !isAttending;
    return matchesSearch;
  });

  const totalRPages = Math.ceil(filteredRsvps.length / ITEMS_PER_PAGE) || 1;
  const currentRsvps = filteredRsvps.slice(
    (rCurrentPage - 1) * ITEMS_PER_PAGE,
    rCurrentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (mCurrentPage > totalMPages) {
      setMCurrentPage(totalMPages);
    }
  }, [memories.length, totalMPages, mCurrentPage]);

  useEffect(() => {
    if (rCurrentPage > totalRPages) {
      setRCurrentPage(totalRPages);
    }
  }, [filteredRsvps.length, totalRPages, rCurrentPage]);

  // Render Login Prompt if Not Authenticated
  if (!isAuthenticated) {
    return (
      <AdminLoginView
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        authError={authError}
        handleLoginSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Sidebar & Top Navigation Bar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        rsvpsCount={rsvps.length}
      />

      {/* Main Content Workspace Area */}
      <main className="admin-main-workspace">
        <div style={{ maxWidth: '1200px', width: '100%' }}>
          {/* TAB 1: Section 2 - My Journey at TDTU */}
          {activeTab === 'journey' && (
            <AdminJourneyTab
              jTitle={jTitle}
              setJTitle={setJTitle}
              jCaption={jCaption}
              setJCaption={setJCaption}
              jFiles={jFiles}
              jPreviews={jPreviews}
              jSubmitting={jSubmitting}
              jMessage={jMessage}
              handleJFileChange={handleJFileChange}
              handleJClearFiles={handleJClearFiles}
              handleJRemovePreview={handleJRemovePreview}
              handleJourneySubmit={handleJourneySubmit}
              journeyLoading={journeyLoading}
              journeyPhotos={journeyPhotos}
              currentJPhotos={currentJPhotos}
              featuredJourneyCount={featuredJourneyCount}
              handleJourneyDelete={handleJourneyDelete}
              handleToggleStar={handleToggleStar}
              setSelectedPhoto={setSelectedPhoto}
              totalJPages={totalJPages}
              jCurrentPage={jCurrentPage}
              setJCurrentPage={setJCurrentPage}
            />
          )}

          {/* TAB 2: Section 5 - Memory Wall */}
          {activeTab === 'memories' && (
            <AdminMemoriesTab
              mName={mName}
              setMName={setMName}
              mCaption={mCaption}
              setMCaption={setMCaption}
              mFiles={mFiles}
              mPreviews={mPreviews}
              mSubmitting={mSubmitting}
              mMessage={mMessage}
              handleMFileChange={handleMFileChange}
              handleMClearFiles={handleMClearFiles}
              handleMRemovePreview={handleMRemovePreview}
              handleMemorySubmit={handleMemorySubmit}
              memLoading={memLoading}
              memories={memories}
              currentMemories={currentMemories}
              handleMemoryDelete={handleMemoryDelete}
              setSelectedPhoto={setSelectedPhoto}
              totalMPages={totalMPages}
              mCurrentPage={mCurrentPage}
              setMCurrentPage={setMCurrentPage}
            />
          )}

          {/* TAB 3: Guest RSVP Management */}
          {activeTab === 'rsvps' && (
            <AdminRsvpTab
              rsvps={rsvps}
              rsvpLoading={rsvpLoading}
              checkIsAttending={checkIsAttending}
              rsvpSearch={rsvpSearch}
              setRsvpSearch={setRsvpSearch}
              rsvpFilterStatus={rsvpFilterStatus}
              setRsvpFilterStatus={setRsvpFilterStatus}
              handleExportCsv={handleExportCsv}
              filteredRsvps={filteredRsvps}
              currentRsvps={currentRsvps}
              handleDeleteRsvp={handleDeleteRsvp}
              totalRPages={totalRPages}
              rCurrentPage={rCurrentPage}
              setRCurrentPage={setRCurrentPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />
          )}
        </div>
      </main>

      {/* Photo Lightbox Popup Modal */}
      <PhotoLightboxModal
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
      />
    </div>
  );
}
