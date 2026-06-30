'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChibiImage from "@/components/ChibiImage";
import Particles from "@/components/Particles";

export default function Home() {
  const section2Ref = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const ctaSectionRef = useRef(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  // RSVP Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);

  // Memories State
  const [memories, setMemories] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', caption: '', image: null });
  const [uploadState, setUploadState] = useState('idle'); // idle | loading | success
  const [imagePreview, setImagePreview] = useState(null);

  const handleScrollClick = () => {
    section2Ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleYesRSVP = () => {
    setHasRSVPed(true);
    setTimeout(() => {
      ctaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNoRSVP = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };

  const handleConfirmSure = () => {
    setIsConfirmOpen(false);
    setHasRSVPed(true);
    setTimeout(() => {
      ctaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.image) {
      alert('Vui lòng chọn một bức ảnh kỷ niệm! 📸');
      return;
    }
    setUploadState('loading');
    const formData = new FormData();
    formData.append('image', uploadData.image);
    formData.append('name', uploadData.name);
    formData.append('caption', uploadData.caption);

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories);
        setUploadState('success');
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadData({ name: '', caption: '', image: null });
          setImagePreview(null);
          setUploadState('idle');
        }, 1500);
      } else {
        alert(data.message || 'Tải ảnh lên thất bại, thử lại sau nhé!');
        setUploadState('idle');
      }
    } catch (err) {
      console.error('Upload submit error:', err);
      alert('Lỗi kết nối máy chủ khi tải ảnh!');
      setUploadState('idle');
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSubmitState('idle');
    setFormData({ name: '', phone: '', email: '' });
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
    if (!formData.name || !formData.phone || !formData.email) return;
    
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
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Đã xảy ra lỗi kết nối, vui lòng thử lại sau! 😢');
      setSubmitState('idle');
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (card1Ref.current) observer.observe(card1Ref.current);
    if (card2Ref.current) observer.observe(card2Ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      {/* Section 1: Hero */}
      <main className="hero-wrapper">
        {/* Sparkle overlays */}
        <div className="sparkle-overlay"></div>
        
        {/* Ambient magical glow layer */}
        <div className="magical-glow"></div>
        
        {/* Floating light particles */}
        <Particles />

        {/* Chibi Graduate Illustration */}
        <div className="chibi-container">
          <ChibiImage
            className="chibi-avatar"
            src="/assets/graduating_chibi_boy.png"
            alt="Cute Anime Graduating Chibi Boy"
            width={280}
            height={280}
          />
        </div>

        {/* Main Text Content */}
        <div className="title-container">
          <div className="graduation-invitation">
            <span className="text-graduation">Graduation</span>
            <span className="text-invitation">Invitation</span>
          </div>
        </div>

        {/* Pulsating Scroll Indicator */}
        <div className="scroll-indicator" id="scroll-btn" onClick={handleScrollClick}>
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="scroll-text">Scroll</span>
        </div>
      </main>

      {/* Section 2: Gratitude */}
      <section className="gratitude-section" ref={section2Ref}>
        
        {/* Background Decorative Sparkles */}
        <div className="bg-sparkle" style={{ top: '15%', left: '10%', opacity: 0.15 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/>
          </svg>
        </div>
        <div className="bg-sparkle" style={{ bottom: '15%', right: '8%', opacity: 0.15 }}>
          <svg width="55" height="55" viewBox="0 0 24 24" fill="#FFD700">
            <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/>
          </svg>
        </div>
        <div className="bg-sparkle" style={{ top: '60%', left: '6%', opacity: 0.1 }}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="#FF8A9A">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Card 1: Trân trọng */}
        <div className="gratitude-card" ref={card1Ref}>
          {/* Card Decorations/Stickers */}
          <div className="sticker sticker-flower-left">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path d="M50 15 C58 2 72 2 78 12 C84 22 84 36 71 44 C84 52 84 66 78 76 C72 86 58 86 50 73 C42 86 28 86 22 76 C16 66 16 52 29 44 C16 36 16 22 22 12 C28 2 42 2 50 15 Z" fill="#FFE3E3" stroke="#FFA6A6" strokeWidth="3"/>
              <circle cx="50" cy="44" r="10" fill="#FFD0D0" />
            </svg>
          </div>
          <div className="sticker sticker-heart-pink">
            <svg viewBox="0 0 24 24" fill="#FF8A9A" width="100%" height="100%">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="sticker sticker-star-gold-1">
            <svg viewBox="0 0 24 24" fill="#FFD700" width="100%" height="100%">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>

          <h2 className="card-title-red">Trân trọng</h2>
          <p className="card-text">
            Trân trọng những kiến thức, những kỹ năng mà mình đã trau dồi và tích tích lũy được. 
            Trân trọng những khoảnh khắc, những cung bậc cảm xúc mà mình đã trải qua. 
            Trân trọng những cố gắng, sự kiên trì của bản thân trước những thử thách và cám dỗ.
          </p>
        </div>

        {/* Card 2: Biết ơn */}
        <div className="gratitude-card" ref={card2Ref}>
          {/* Card Decorations/Stickers */}
          <div className="sticker sticker-cat">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <ellipse cx="50" cy="65" rx="35" ry="25" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
              <circle cx="35" cy="45" r="16" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
              <path d="M22 34 L12 14 L28 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M48 34 L58 14 L42 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M27 47 Q32 52 37 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 47 Q17 52 22 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="14" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
              <ellipse cx="36" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
              <path d="M85 65 Q95 65 88 52" fill="none" stroke="#FFA366" strokeWidth="4.5" strokeLinecap="round" />
              <text x="68" y="28" fill="#FF8000" fontSize="12" fontFamily="Fredoka" fontWeight="bold">z</text>
              <text x="76" y="18" fill="#FF8000" fontSize="16" fontFamily="Fredoka" fontWeight="bold">Z</text>
            </svg>
          </div>
          <div className="sticker sticker-flower-right">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path d="M50 15 C58 2 72 2 78 12 C84 22 84 36 71 44 C84 52 84 66 78 76 C72 86 58 86 50 73 C42 86 28 86 22 76 C16 66 16 52 29 44 C16 36 16 22 22 12 C28 2 42 2 50 15 Z" fill="#E8F4FF" stroke="#8CB9FF" strokeWidth="3"/>
              <circle cx="50" cy="44" r="10" fill="#BFDAFF" />
            </svg>
          </div>
          <div className="sticker sticker-heart-blue">
            <svg viewBox="0 0 24 24" fill="#8EBAFF" width="100%" height="100%">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="sticker sticker-star-gold-2">
            <svg viewBox="0 0 24 24" fill="#FFD700" width="100%" height="100%">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>

          <h2 className="card-title-blue">Biết ơn</h2>
          <p className="card-text">
            Biết ơn cha mẹ, thầy cô, bạn bè, những người đã luôn bên cạnh, động viên và hỗ trợ con/em/mình 
            trong suốt chặng đường học tập. Sự quan tâm và yêu thương ấy chính là ngọn đèn soi sáng tôi trên con đường trưởng thành.
          </p>
        </div>
      </section>

      {/* Section 2.5: RSVP Question Section */}
      <section className="rsvp-section">
        {/* Scattered Stickers */}
        <div className="sticker rsvp-sticker-cat">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <ellipse cx="50" cy="65" rx="35" ry="25" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
            <circle cx="35" cy="45" r="16" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
            <path d="M22 34 L12 14 L28 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M48 34 L58 14 L42 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M27 47 Q32 52 37 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 47 Q17 52 22 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="14" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
            <ellipse cx="36" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
            <path d="M85 65 Q95 65 88 52" fill="none" stroke="#FFA366" strokeWidth="4.5" strokeLinecap="round" />
            <text x="68" y="28" fill="#FF8000" fontSize="12" fontFamily="Fredoka" fontWeight="bold">z</text>
            <text x="76" y="18" fill="#FF8000" fontSize="16" fontFamily="Fredoka" fontWeight="bold">Z</text>
          </svg>
        </div>
        <div className="sticker rsvp-sticker-star-1">
          <svg viewBox="0 0 24 24" fill="#FFD700" width="100%" height="100%">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
        <div className="sticker rsvp-sticker-flower">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path d="M50 15 C58 2 72 2 78 12 C84 22 84 36 71 44 C84 52 84 66 78 76 C72 86 58 86 50 73 C42 86 28 86 22 76 C16 66 16 52 29 44 C16 36 16 22 22 12 C28 2 42 2 50 15 Z" fill="#FFE3E3" stroke="#FFA6A6" strokeWidth="3"/>
            <circle cx="50" cy="44" r="10" fill="#FFD0D0" />
          </svg>
        </div>
        <div className="sticker rsvp-sticker-heart">
          <svg viewBox="0 0 24 24" fill="#FF8A9A" width="100%" height="100%">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Stylized blue flower rose logo */}
        <div className="rsvp-flower">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#EBF4FF" stroke="#BDDAFF" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M60 25C70 20 85 25 85 40C85 55 60 75 60 75C60 75 35 55 35 40C35 25 50 20 60 25Z" fill="#BDDAFF" opacity="0.6"/>
            <path d="M60 35C66 31 77 34 77 44C77 54 60 67 60 67C60 67 43 54 43 44C43 31 54 31 60 35Z" fill="#8CB9FF" opacity="0.8"/>
            <path d="M60 42C63 39 70 41 70 47C70 53 60 60 60 60C60 60 50 53 50 47C50 39 57 39 60 42Z" fill="#3F75C4" />
            <circle cx="60" cy="46" r="2" fill="#FFD700"/>
            <circle cx="56" cy="49" r="1.5" fill="#FFD700"/>
            <circle cx="64" cy="49" r="1.5" fill="#FFD700"/>
          </svg>
        </div>

        <h2 className="rsvp-text">
          Một <span className="highlight-red">chương “đời”</span> nữa đã được hoàn thành, bạn sẽ đến cùng mình để <span className="highlight-blue">chung vui</span> khoảnh khắc đó nha! (Năn nỉ x3,14)
        </h2>

        <div className="rsvp-buttons-container">
          <button className="btn-yes" onClick={handleYesRSVP}>
            Chắc chắn rùi:3
          </button>
          <button className="btn-no" onClick={handleNoRSVP}>
            Mình bận ời
          </button>
        </div>
      </section>

      {/* Section 3: Call To Action */}
      <section className={`cta-section ${hasRSVPed ? 'show-rsvp' : 'hidden-rsvp'}`} ref={ctaSectionRef}>
        {/* Scattered Stickers */}
        <div className="sticker cta-sticker-cat">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <ellipse cx="50" cy="65" rx="35" ry="25" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
            <circle cx="35" cy="45" r="16" fill="#FFF2E6" stroke="#FFA366" strokeWidth="3.5" />
            <path d="M22 34 L12 14 L28 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M48 34 L58 14 L42 25 Z" fill="#FFE5CC" stroke="#FFA366" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M27 47 Q32 52 37 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 47 Q17 52 22 47" fill="none" stroke="#663300" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="14" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
            <ellipse cx="36" cy="52" rx="4" ry="2" fill="#FF9999" opacity="0.6" />
            <path d="M85 65 Q95 65 88 52" fill="none" stroke="#FFA366" strokeWidth="4.5" strokeLinecap="round" />
            <text x="68" y="28" fill="#FF8000" fontSize="12" fontFamily="Fredoka" fontWeight="bold">z</text>
            <text x="76" y="18" fill="#FF8000" fontSize="16" fontFamily="Fredoka" fontWeight="bold">Z</text>
          </svg>
        </div>
        <div className="sticker cta-sticker-star">
          <svg viewBox="0 0 24 24" fill="#FFD700" width="100%" height="100%">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
        <div className="sticker cta-sticker-heart">
          <svg viewBox="0 0 24 24" fill="#FF8A9A" width="100%" height="100%">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="sticker cta-sticker-flower">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path d="M50 15 C58 2 72 2 78 12 C84 22 84 36 71 44 C84 52 84 66 78 76 C72 86 58 86 50 73 C42 86 28 86 22 76 C16 66 16 52 29 44 C16 36 16 22 22 12 C28 2 42 2 50 15 Z" fill="#E8F4FF" stroke="#8CB9FF" strokeWidth="3"/>
            <circle cx="50" cy="44" r="10" fill="#BFDAFF" />
          </svg>
        </div>

        <h2 className="cta-header">Và để lưu giữ và đánh dấu chặng đường đó</h2>
        <p className="cta-subheader">
          Em/mình mong được lưu lại những khoảnh khắc ý nghĩa ấy cùng với những &quot;người thân yêu&quot; của em/mình.
        </p>
        
        <p className="cta-prompt">&quot;Người thương&quot; hãy click vào đây</p>
        
        <div className="interactive-area">
          <button className="coral-btn" onClick={handleOpenModal}>
            <svg className="sparkle-effect sp-1" viewBox="0 0 24 24" fill="#FFF"><path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/></svg>
            <svg className="sparkle-effect sp-2" viewBox="0 0 24 24" fill="#FFF"><path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/></svg>
            <svg className="sparkle-effect sp-3" viewBox="0 0 24 24" fill="#FFF"><path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/></svg>
            <svg className="sparkle-effect sp-4" viewBox="0 0 24 24" fill="#FFF"><path d="M12 2l2.4 7.2L22 11.6l-5.6 5.6 1.6 8-6-4.8-6 4.8 1.6-8L2 11.6l7.6-2.4L12 2z"/></svg>
            
            ✨ Nhận Thiệp Ngay ✨
          </button>
        </div>
      </section>

      {/* Section 4: Memory Film Strip Wall */}
      {hasRSVPed && (
        <section className="memories-section">
          {/* Decorative background stickers */}
          <div className="sticker memory-sticker-star">
            <svg viewBox="0 0 24 24" fill="#FFD700" width="100%" height="100%">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          <div className="sticker memory-sticker-heart">
            <svg viewBox="0 0 24 24" fill="#FF8A9A" width="100%" height="100%">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <h2 className="memories-title">Bức tường Kỷ niệm</h2>
          <p className="memories-subtitle">
            Gửi những khoảnh khắc đáng yêu của chúng mình để chạy trên dải phim kỷ niệm nhé!
          </p>

          {/* Upload Button */}
          <div className="upload-trigger-container">
            <button className="upload-btn" onClick={() => setIsUploadOpen(true)}>
              ✨ Gửi Ảnh Kỷ Niệm ✨
            </button>
          </div>

          {/* Film Rolls Container */}
          <div className="film-rolls-container">
            {/* Film Roll 1: Left-to-Right */}
            <div className="film-roll-wrapper row-ltr">
              <div className="film-strip">
                {memories.map((m, idx) => (
                  <div className="film-frame" key={`ltr1-${m.id}-${idx}`}>
                    <div className="film-photo">
                      <img src={m.imageUrl} alt={m.name} />
                      <div className="film-photo-info">
                        <span className="film-photo-name">{m.name}</span>
                        <span className="film-photo-caption">{m.caption}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {memories.map((m, idx) => (
                  <div className="film-frame" key={`ltr2-${m.id}-${idx}`}>
                    <div className="film-photo">
                      <img src={m.imageUrl} alt={m.name} />
                      <div className="film-photo-info">
                        <span className="film-photo-name">{m.name}</span>
                        <span className="film-photo-caption">{m.caption}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Film Roll 2: Right-to-Left */}
            <div className="film-roll-wrapper row-rtl">
              <div className="film-strip">
                {[...memories].reverse().map((m, idx) => (
                  <div className="film-frame" key={`rtl1-${m.id}-${idx}`}>
                    <div className="film-photo">
                      <img src={m.imageUrl} alt={m.name} />
                      <div className="film-photo-info">
                        <span className="film-photo-name">{m.name}</span>
                        <span className="film-photo-caption">{m.caption}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {[...memories].reverse().map((m, idx) => (
                  <div className="film-frame" key={`rtl2-${m.id}-${idx}`}>
                    <div className="film-photo">
                      <img src={m.imageUrl} alt={m.name} />
                      <div className="film-photo-info">
                        <span className="film-photo-name">{m.name}</span>
                        <span className="film-photo-caption">{m.caption}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upload Memory Modal Popup Overlay */}
      <div className={`modal-overlay ${isUploadOpen ? 'open' : ''}`} onClick={() => setIsUploadOpen(false)}>
        <div className="modal-card upload-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsUploadOpen(false)} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {uploadState !== 'success' ? (
            <>
              <div className="modal-header-banner">
                <div className="modal-header-avatar">
                  <img src="/assets/graduating_chibi_boy.png" alt="Chibi Graduate" />
                </div>
                <div className="modal-header-bubble">
                  Gửi ảnh và lời chúc của bạn vào cuộn phim nhé! 📸
                </div>
              </div>

              <form onSubmit={handleUploadSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên của bạn</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ví dụ: Khương Dương"
                    className="form-input"
                    value={uploadData.name}
                    onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Lời nhắn / Kỷ niệm</label>
                  <input
                    name="caption"
                    type="text"
                    required
                    placeholder="Ví dụ: Chúc mừng ngày lễ tốt nghiệp nha!"
                    className="form-input"
                    value={uploadData.caption}
                    onChange={(e) => setUploadData(prev => ({ ...prev, caption: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn ảnh kỷ niệm</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      id="memory-file-input"
                      className="file-upload-input"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="memory-file-input" className="file-upload-label">
                      {imagePreview ? 'Thay đổi ảnh' : '📁 Tải ảnh từ thiết bị'}
                    </label>
                  </div>
                </div>

                {imagePreview && (
                  <div className="image-preview-frame">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}

                <button type="submit" className="modal-submit-btn" disabled={uploadState === 'loading'}>
                  {uploadState === 'loading' ? (
                    <>
                      <div className="spinner"></div>
                      <span>Đang gửi ảnh...</span>
                    </>
                  ) : (
                    <span>Gửi Ảnh Lên Cuộn Phim 🚀</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="success-container">
              <svg className="success-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h3 className="success-title">Gửi ảnh thành công!</h3>
              <p className="success-text">
                Ảnh kỷ niệm của bạn đang chạy trên cuộn phim rồi nhé! 🎞️✨
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Form Modal Overlay */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {submitState !== 'success' ? (
            <>
              <div className="modal-header-banner">
                <div className="modal-header-avatar">
                  <img src="/assets/graduating_chibi_boy.png" alt="Chibi Graduate" />
                </div>
                <div className="modal-header-bubble">
                  Điền thông tin để nhận thiệp cá nhân nhé!
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="input-name">Họ và tên</label>
                  <input
                    id="input-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-phone">Số điện thoại</label>
                  <input
                    id="input-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="Ví dụ: 090xxxxxxx"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-email">Email</label>
                  <input
                    id="input-email"
                    name="email"
                    type="email"
                    required
                    placeholder="Ví dụ: guest@gmail.com"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="modal-submit-btn" disabled={submitState === 'loading'}>
                  {submitState === 'loading' ? (
                    <>
                      <div className="spinner"></div>
                      <span>Đang tạo thiệp...</span>
                    </>
                  ) : (
                    <span>Nhận Thiệp Ngay ✨</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="success-container">
              <svg className="success-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h3 className="success-title">Đăng ký thành công!</h3>
              <p className="success-text">
                Check mail để nhận thiệp độc quyền từ mình nhé! 💖
              </p>
              <button className="modal-submit-btn" style={{ marginTop: '16px' }} onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up RSVP Confirmation Modal Overlay */}
      <div className={`confirm-modal-overlay ${isConfirmOpen ? 'open' : ''}`} onClick={handleConfirmClose}>
        <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="confirm-emoji-container">🥺</div>
          <h3 className="confirm-text">
            Bạn có chắc chắn chưa, suy nghĩ lại đi mò T.T
          </h3>
          <div className="confirm-buttons">
            <button className="btn-confirm-no" onClick={handleConfirmSure}>
              Sẽ tham gia
            </button>
            <button className="btn-confirm-yes" onClick={handleConfirmClose}>
              Huỷ bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
