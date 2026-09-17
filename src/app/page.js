'use client';

import React, { useEffect, useRef, useState } from 'react';
import Particles from "@/components/Particles";
import GlobalBackground from "@/components/GlobalBackground";
import HeroSection from "@/components/HeroSection";
import JourneySection from "@/components/JourneySection";
import CeremonySection from "@/components/CeremonySection";
import RsvpModal from "@/components/RsvpModal";
import MemoriesSection from "@/components/MemoriesSection";
import MapSection from "@/components/MapSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import AdminAuthModal from "@/components/AdminAuthModal";
import JourneyGlobeModal from "@/components/JourneyGlobeModal";

export default function Home() {
  const section2Ref = useRef(null);
  const memoryWallRef = useRef(null);
  const heroRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const isUploadingRef = useRef(false);

  // Admin Auth Pop-up State
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // 3D Photo Globe Modal State
  const [isGlobeOpen, setIsGlobeOpen] = useState(false);

  // Global Parallax mouse depth tracking across full window
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const mouseX = (e.clientX - centerX) / (window.innerWidth / 2);
      const mouseY = (e.clientY - centerY) / (window.innerHeight / 2);
      setParallaxOffset({ x: mouseX, y: mouseY });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Section 2 Dynamic Photos State
  const [journeyPhotos, setJourneyPhotos] = useState([]);

  // Form Modal State (RSVP)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState('idle');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', status: 'Xác nhận tham gia' });

  // Memories & Photo Detail Modal State
  const [memories, setMemories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', caption: '', images: [] });
  const [uploadState, setUploadState] = useState('idle');
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleScrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToMemories = () => {
    memoryWallRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Section 2 Journey Photos
  useEffect(() => {
    const fetchJourneyPhotos = async () => {
      try {
        const res = await fetch('/api/journey');
        const data = await res.json();
        if (data.success && data.photos) {
          setJourneyPhotos(data.photos);
        }
      } catch (err) {
        console.error('Failed to fetch journey photos', err);
      }
    };
    fetchJourneyPhotos();
  }, []);

  // Fetch Section 5 Cloudinary Memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await fetch('/api/memories');
        const data = await res.json();
        if (data.success) {
          setMemories(data.memories);
        }
      } catch (err) {
        console.error('Failed to fetch memories', err);
      }
    };
    fetchMemories();
  }, []);

  // Cloudinary File Upload Handlers
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setUploadData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedFiles]
      }));

      const newPreviews = [];
      let loadedCount = 0;
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          loadedCount++;
          if (loadedCount === selectedFiles.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadOpen(true);
    setUploadState('idle');
    isUploadingRef.current = false;
    setUploadData({ name: '', caption: '', images: [] });
    setImagePreviews([]);
  };

  const handleCloseUploadModal = () => {
    setIsUploadOpen(false);
    setUploadState('idle');
    isUploadingRef.current = false;
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (isUploadingRef.current || uploadState === 'loading' || uploadState === 'success') return;
    if (!uploadData.images || uploadData.images.length === 0) {
      alert('Vui lòng chọn ít nhất một bức ảnh kỷ niệm! 📸');
      return;
    }
    isUploadingRef.current = true;
    setUploadState('loading');

    const bodyFormData = new FormData();
    uploadData.images.forEach((file) => {
      bodyFormData.append('images', file);
    });
    bodyFormData.append('name', uploadData.name);
    bodyFormData.append('caption', uploadData.caption);

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        body: bodyFormData
      });
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories);
        setUploadState('success');
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadState('idle');
          isUploadingRef.current = false;
        }, 1500);
      } else {
        alert(data.message || 'Tải ảnh lên thất bại!');
        setUploadState('idle');
        isUploadingRef.current = false;
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Lỗi kết nối máy chủ khi tải ảnh!');
      setUploadState('idle');
      isUploadingRef.current = false;
    }
  };

  // RSVP Modal Handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSubmitState('idle');
    isSubmittingRef.current = false;
    setFormData({ name: '', phone: '', email: '', status: 'Xác nhận tham gia' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitState === 'loading' || submitState === 'success') return;
    if (!formData.name || !formData.phone || !formData.email) return;

    isSubmittingRef.current = true;
    setSubmitState('loading');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitState('success');
      } else {
        alert('Đã xảy ra lỗi, vui lòng thử lại sau! 😢');
        setSubmitState('idle');
        isSubmittingRef.current = false;
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Đã xảy ra lỗi kết nối, vui lòng thử lại sau! 😢');
      setSubmitState('idle');
      isSubmittingRef.current = false;
    }
  };

  // Default journey photos if backend array is sparse
  const defaultJourneyGrid = [
    { imageUrl: journeyPhotos[0]?.imageUrl || '/default_memories/memory_grad_solo.png', title: journeyPhotos[0]?.title || 'TDTU Campus' },
    { imageUrl: journeyPhotos[1]?.imageUrl || '/default_memories/memory_grad_chibi.png', title: journeyPhotos[1]?.title || 'Kỷ niệm' },
    { imageUrl: journeyPhotos[2]?.imageUrl || '/default_memories/memory_grad_cap.png', title: journeyPhotos[2]?.title || 'Ước mơ' },
    { imageUrl: journeyPhotos[3]?.imageUrl || '/default_memories/memory_grad_group.png', title: journeyPhotos[3]?.title || 'Bạn bè' },
    { imageUrl: journeyPhotos[4]?.imageUrl || '/assets/test.JPG', title: journeyPhotos[4]?.title || 'Thanh xuân' },
  ];

  return (
    <>
      <GlobalBackground parallaxOffset={parallaxOffset} />

      <div className="app-container">
        <Particles />

        <HeroSection
          heroRef={heroRef}
          parallaxOffset={parallaxOffset}
          onBeginJourney={handleScrollToSection2}
          onOpenAdminModal={() => setIsAdminAuthOpen(true)}
        />

        <JourneySection
          section2Ref={section2Ref}
          onOpenGlobeModal={() => setIsGlobeOpen(true)}
          onScrollToMemories={handleScrollToMemories}
          photos={journeyPhotos}
          onPhotoClick={(p) => setSelectedPhoto(p)}
        />

        <CeremonySection onOpenModal={handleOpenModal} />

        <RsvpModal
          isModalOpen={isModalOpen}
          onCloseModal={handleCloseModal}
          submitState={submitState}
          onSubmit={handleSubmit}
          formData={formData}
          onInputChange={handleInputChange}
          setFormData={setFormData}
        />

        <MemoriesSection
          memoryWallRef={memoryWallRef}
          memories={memories}
          selectedPhoto={selectedPhoto}
          setSelectedPhoto={setSelectedPhoto}
          isUploadOpen={isUploadOpen}
          uploadData={uploadData}
          setUploadData={setUploadData}
          uploadState={uploadState}
          imagePreviews={imagePreviews}
          onOpenUploadModal={handleOpenUploadModal}
          onCloseUploadModal={handleCloseUploadModal}
          onUploadSubmit={handleUploadSubmit}
          onFileChange={handleFileChange}
        />

        <MapSection />

        <ContactSection />

        <Footer />
      </div>

      {/* Admin Password Authentication Pop-up Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
      />

      {/* 3D Photo Globe Modal for Section 2 (My Journey) */}
      <JourneyGlobeModal
        isOpen={isGlobeOpen}
        onClose={() => setIsGlobeOpen(false)}
        photos={journeyPhotos}
      />
    </>
  );
}
