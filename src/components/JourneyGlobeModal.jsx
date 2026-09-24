'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatImageUrl } from '@/utils/image';

const defaultGlobePhotos = [];

// Galaxy Starfield HTML5 Canvas Component (Mobile Optimized)
function GalaxyStarfield({ isMobile }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const starCount = isMobile ? 35 : 100;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.0 + 0.6,
      color: ['#00F0FF', '#FF6B8B', '#FFD700', '#A855F7', '#FFFFFF', '#38BDF8'][Math.floor(Math.random() * 6)],
      alpha: Math.random(),
      twinkleFactor: (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1)
    }));

    const cometCount = isMobile ? 1 : 3;
    const comets = Array.from({ length: cometCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height / 2),
      length: Math.random() * 80 + 40,
      speed: Math.random() * 4 + 2,
      angle: Math.PI / 4,
      opacity: 0
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Twinkling Stars
      stars.forEach((star) => {
        star.alpha += star.twinkleFactor;
        if (star.alpha > 1 || star.alpha < 0.15) {
          star.twinkleFactor = -star.twinkleFactor;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.15, Math.min(1, star.alpha));
        ctx.fillStyle = star.color;
        
        if (!isMobile) {
          ctx.shadowColor = star.color;
          ctx.shadowBlur = star.radius * 4;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!isMobile && star.radius > 1.8) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - star.radius * 3.5, star.y);
          ctx.lineTo(star.x + star.radius * 3.5, star.y);
          ctx.moveTo(star.x, star.y - star.radius * 3.5);
          ctx.lineTo(star.x, star.y + star.radius * 3.5);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Comets
      comets.forEach((comet) => {
        if (Math.random() < 0.005 && comet.opacity <= 0) {
          comet.x = Math.random() * width * 0.7;
          comet.y = Math.random() * (height * 0.4);
          comet.opacity = 1;
        }

        if (comet.opacity > 0) {
          comet.x += Math.cos(comet.angle) * comet.speed;
          comet.y += Math.sin(comet.angle) * comet.speed;
          comet.opacity -= 0.015;

          ctx.save();
          ctx.globalAlpha = Math.max(0, comet.opacity);
          const gradient = ctx.createLinearGradient(
            comet.x,
            comet.y,
            comet.x - Math.cos(comet.angle) * comet.length,
            comet.y - Math.sin(comet.angle) * comet.length
          );
          gradient.addColorStop(0, '#00F0FF');
          gradient.addColorStop(0.3, '#FF6B8B');
          gradient.addColorStop(1, 'transparent');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(
            comet.x - Math.cos(comet.angle) * comet.length,
            comet.y - Math.sin(comet.angle) * comet.length
          );
          ctx.stroke();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        width: '100%',
        height: '100%'
      }}
    />
  );
}

export default function JourneyGlobeModal({ isOpen, onClose, photos = [] }) {
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const cardRefs = useRef([]);
  const rotYRef = useRef(0);
  const rotXRef = useRef(0.2);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef(0);

  const [fetchedPhotos, setFetchedPhotos] = useState(photos);

  useEffect(() => {
    if (Array.isArray(photos) && photos.length > 0) {
      setFetchedPhotos(photos);
    }
  }, [photos]);

  const handleRandomizeAngle = () => {
    rotYRef.current = Math.random() * Math.PI * 2;
    rotXRef.current = (Math.random() - 0.5) * 1.2;
    velocityRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
  };

  useEffect(() => {
    if (isOpen) {
      handleRandomizeAngle();
      fetch(`/api/journey?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.photos) && data.photos.length > 0) {
            setFetchedPhotos(data.photos);
          }
        })
        .catch((err) => console.error('Globe modal fetch error:', err));
    }
  }, [isOpen]);

  // Prepare full list of photos
  const activePhotos = (Array.isArray(fetchedPhotos) && fetchedPhotos.length > 0)
    ? fetchedPhotos
    : ((Array.isArray(photos) && photos.length > 0) ? photos : defaultGlobePhotos);
  const sourcePhotos = activePhotos;
  
  const globeItems = [...sourcePhotos];

  // Mobile responsive dimensions tracking
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1000);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  const sphereRadius = isSmallMobile ? 120 : isMobile ? 160 : 240;
  const baseCardWidth = isSmallMobile ? 80 : isMobile ? 105 : 140;
  const baseCardHeight = isSmallMobile ? 58 : isMobile ? 75 : 100;
  const coreDiameter = isSmallMobile ? 140 : isMobile ? 180 : 260;

  // Pre-calculate 3D Spherical positions using Fibonacci Spiral distribution
  const pointsRef = useRef([]);
  useEffect(() => {
    const total = globeItems.length;
    const pts = [];

    for (let i = 0; i < total; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.cos(phi);
      const z = sphereRadius * Math.sin(phi) * Math.sin(theta);

      pts.push({ x, y, z, photo: globeItems[i] });
    }
    pointsRef.current = pts;
  }, [globeItems.length, isOpen, sphereRadius]);

  // High-performance direct DOM transform render loop (bypasses React setState overhead)
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();

    const renderLoop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Apply auto spin if enabled and not currently dragging or hovering
      if (isAutoSpinning && !isDraggingRef.current && hoveredIdx === null) {
        rotYRef.current += 0.35 * dt;
      }

      // Apply drag velocity decay
      if (!isDraggingRef.current) {
        rotYRef.current += velocityRef.current.x;
        rotXRef.current += velocityRef.current.y;
        velocityRef.current.x *= 0.93;
        velocityRef.current.y *= 0.93;
      }

      rotXRef.current = Math.max(-1.4, Math.min(1.4, rotXRef.current));

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      // Direct DOM mutation for 60 FPS mobile performance
      const pts = pointsRef.current;
      for (let i = 0; i < pts.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const pt = pts[i];
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.z * cosY + pt.x * sinY;

        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + pt.y * sinX;

        const scale = ((z2 + sphereRadius * 1.5) / (sphereRadius * 2.5)) * zoomLevel;
        const opacity = Math.max(0.2, Math.min(1, (z2 + sphereRadius * 1.2) / (sphereRadius * 2.2)));
        const screenX = x1 * zoomLevel;
        const screenY = y2 * zoomLevel;
        const zIndex = Math.round(z2 + 1000);

        const isHovered = hoveredIdx === i;
        const activeScale = isHovered ? Math.max(0.5, scale) * 1.25 : Math.max(0.4, scale);

        el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) scale(${activeScale})`;
        el.style.opacity = isHovered ? '1' : opacity;
        el.style.zIndex = isHovered ? 9999 : zIndex;
        el.style.display = 'block';
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isAutoSpinning, hoveredIdx, sphereRadius, zoomLevel]);

  // Mouse & Touch Drag Controls
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    touchDistRef.current = 0;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseRef.current.x;
    const deltaY = e.clientY - lastMouseRef.current.y;
    touchDistRef.current += Math.abs(deltaX) + Math.abs(deltaY);

    rotYRef.current += deltaX * 0.006;
    rotXRef.current -= deltaY * 0.006;

    velocityRef.current = {
      x: deltaX * 0.003,
      y: -deltaY * 0.003
    };

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    touchDistRef.current = 0;
    lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMouseRef.current.x;
    const deltaY = e.touches[0].clientY - lastMouseRef.current.y;
    touchDistRef.current += Math.abs(deltaX) + Math.abs(deltaY);

    rotYRef.current += deltaX * 0.007;
    rotXRef.current -= deltaY * 0.007;

    velocityRef.current = {
      x: deltaX * 0.004,
      y: -deltaY * 0.004
    };

    lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleCardClick = (photo) => {
    if (touchDistRef.current < 10) {
      setSelectedPhoto(photo);
    }
  };

  // Keyboard Navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPhoto, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(4, 5, 13, 0.95)',
      backdropFilter: isMobile ? 'blur(10px)' : 'blur(25px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      userSelect: 'none',
      overflow: 'hidden',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Cosmic Nebula Background Layers */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 50%, #0d0826 0%, #060514 60%, #020208 100%)'
      }}>
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '50vw',
              height: '50vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(112, 0, 255, 0.32) 0%, rgba(0, 240, 255, 0.18) 50%, transparent 80%)',
              filter: 'blur(70px)',
              animation: 'pulseGlow 12s infinite alternate ease-in-out'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '8%',
              right: '12%',
              width: '45vw',
              height: '45vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 42, 85, 0.28) 0%, rgba(147, 51, 234, 0.22) 50%, transparent 80%)',
              filter: 'blur(80px)',
              animation: 'pulseGlow 10s infinite alternate-reverse ease-in-out'
            }} />
          </>
        )}

        {/* Floating Glowing Symbols */}
        <div className="galaxy-floating-symbol" style={{ top: '10%', left: '8%', color: '#00F0FF', fontSize: '1.9rem', animationDelay: '0s' }}>✦</div>
        <div className="galaxy-floating-symbol" style={{ top: '18%', right: '12%', color: '#FFD700', fontSize: '2.4rem', animationDelay: '1.4s' }}>✨</div>
        <div className="galaxy-floating-symbol" style={{ bottom: '24%', left: '10%', color: '#FF6B8B', fontSize: '2.1rem', animationDelay: '2.8s' }}>💫</div>
        <div className="galaxy-floating-symbol" style={{ bottom: '16%', right: '16%', color: '#A855F7', fontSize: '2.5rem', animationDelay: '0.7s' }}>🪐</div>
      </div>

      {/* Dynamic HTML5 Canvas Starfield */}
      <GalaxyStarfield isMobile={isMobile} />

      {/* TOP HEADER BAR */}
      <header style={{
        width: '100%',
        padding: isMobile ? '12px 16px' : '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(6, 7, 17, 0.9), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px' }}>
          <div style={{
            width: isMobile ? '38px' : '46px',
            height: isMobile ? '38px' : '46px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.7), 0 0 30px rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            flexShrink: 0
          }}>
            <img
              src="/assets/logoTDTU.png"
              alt="TDTU Logo"
              style={{ width: '82%', height: '82%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '1.05rem' : '1.35rem', fontWeight: 800, color: '#00F0FF', letterSpacing: '-0.02em' }}>
              My Journey 3D Globe
            </h2>
            {!isSmallMobile && (
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                Quả địa cầu 3D lưu giữ toàn bộ hình ảnh hành trình TDTU
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '4px 10px' : '6px 16px',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#00F0FF',
            fontWeight: '600'
          }}>
            📸 {sourcePhotos.length} ảnh
          </div>

          <button
            onClick={onClose}
            style={{
              width: isMobile ? '36px' : '42px',
              height: isMobile ? '36px' : '42px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFF',
              fontSize: isMobile ? '1rem' : '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Đóng cửa sổ 3D (ESC)"
          >
            ✕
          </button>
        </div>
      </header>

      {/* CENTRAL 3D SPHERE CANVAS CONTAINER */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          zIndex: 5
        }}
      >
        {/* Glowing 3D Central White Core Sphere with TDTU Logo */}
        <div style={{
          position: 'absolute',
          width: `${coreDiameter}px`,
          height: `${coreDiameter}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)',
          boxShadow: '0 0 90px rgba(255, 255, 255, 0.85), inset 0 0 40px rgba(0, 240, 255, 0.35), 0 0 50px rgba(0, 240, 255, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.95)',
          pointerEvents: 'none',
          animation: 'globePulse 4s infinite alternate ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/assets/logoTDTU.png"
            alt="TDTU Logo Core"
            style={{
              width: '68%',
              height: '68%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: '-24px',
            borderRadius: '50%',
            border: '1px dashed rgba(0, 240, 255, 0.45)',
            transform: 'rotateX(70deg)',
            animation: 'orbitSpin 18s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            inset: '-36px',
            borderRadius: '50%',
            border: '1px dashed rgba(255, 42, 85, 0.4)',
            transform: 'rotateY(65deg)',
            animation: 'orbitSpinReverse 25s linear infinite'
          }} />
        </div>

        {/* Render 3D Floating Photo Cards using Direct DOM refs */}
        {globeItems.map((photo, idx) => (
          <div
            key={photo.id || idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => handleCardClick(photo)}
            onTouchEnd={() => handleCardClick(photo)}
            style={{
              position: 'absolute',
              width: `${baseCardWidth}px`,
              height: `${baseCardHeight}px`,
              cursor: 'pointer',
              willChange: 'transform, opacity'
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(15, 20, 40, 0.88)',
              border: hoveredIdx === idx
                ? '2px solid #00F0FF'
                : photo.isFeatured
                  ? '1.5px solid #FFD700'
                  : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: hoveredIdx === idx
                ? '0 10px 30px rgba(0, 240, 255, 0.6)'
                : photo.isFeatured
                  ? '0 4px 20px rgba(255, 215, 0, 0.3)'
                  : '0 4px 15px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}>
              <img
                src={formatImageUrl(photo.imageUrl || photo.image)}
                alt={photo.title || 'Kỷ niệm'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none'
                }}
              />

              {photo.title && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 8px 6px 8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    fontSize: isMobile ? '0.68rem' : '0.78rem',
                    fontWeight: '700',
                    color: '#FFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                  }}>
                    {photo.title}
                  </div>
                </div>
              )}

              {photo.isFeatured && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '0.75rem',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                }}>
                  ⭐
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM CONTROLS BAR */}
      <footer style={{
        width: '100%',
        padding: isMobile ? '12px 16px 18px 16px' : '16px 32px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10,
        background: 'linear-gradient(to top, rgba(6, 7, 17, 0.95), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setIsAutoSpinning(!isAutoSpinning)}
            style={{
              padding: isMobile ? '8px 14px' : '10px 18px',
              borderRadius: '20px',
              background: isAutoSpinning ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
              border: isAutoSpinning ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.2)',
              color: isAutoSpinning ? '#00F0FF' : '#FFF',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isAutoSpinning ? '⏸️ Tạm dừng xoay' : '▶️ Tiếp tục xoay'}
          </button>

          <button
            onClick={handleRandomizeAngle}
            style={{
              padding: isMobile ? '8px 14px' : '10px 18px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFF',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Đổi góc quay ngẫu nhiên mới"
          >
            🔄 Reset góc quay
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="Thu nhỏ 3D globe"
            >
              −
            </button>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFF',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="Phóng to 3D globe"
            >
              +
            </button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.55)', textAlign: 'center' }}>
          💡 <strong>Mẹo:</strong> Rê chuột / Vuốt để xoay quả địa cầu 3D. Nhấn vào từng bức ảnh để xem phóng to chi tiết!
        </p>
      </footer>

      {/* Photo Lightbox Popup */}
      {selectedPhoto && (
        <div className="glass-modal-overlay open" onClick={() => setSelectedPhoto(null)} style={{ zIndex: 10000 }}>
          <div className="glass-modal-content photo-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSelectedPhoto(null)}>✕</button>

            <div style={{
              width: '100%',
              maxHeight: '78vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              overflow: 'hidden',
              background: 'rgba(0, 0, 0, 0.4)'
            }}>
              <img
                src={formatImageUrl(selectedPhoto.imageUrl || selectedPhoto.image)}
                alt={selectedPhoto.title || selectedPhoto.name || 'Kỷ niệm'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '78vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '14px',
                  display: 'block'
                }}
              />
            </div>

            {(selectedPhoto.title || selectedPhoto.name || selectedPhoto.caption) && (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                {(selectedPhoto.title || selectedPhoto.name) && (
                  <h4 style={{ margin: 0, color: '#FFF', fontSize: '1.2rem', wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💌</span>
                    <span>{selectedPhoto.title || selectedPhoto.name}</span>
                  </h4>
                )}

                {selectedPhoto.caption && (
                  <p className="lightbox-photo-caption" style={{ marginTop: (selectedPhoto.title || selectedPhoto.name) ? '6px' : '0px' }}>
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
