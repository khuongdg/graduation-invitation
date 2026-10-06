'use client';

import React, { useEffect, useRef } from 'react';
import { formatImageUrl } from '@/utils/image';

export default function FilmRoll({ memories = [], direction = 'ltr', onPhotoClick }) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isHoveredRef = useRef(false);
  const animFrameRef = useRef(null);
  const moveDistRef = useRef(0);
  const touchTimerRef = useRef(null);

  const safeMemories = Array.isArray(memories) ? memories : [];
  const displayMemories = direction === 'rtl' ? [...safeMemories].reverse() : safeMemories;

  // Pad photos so 1 set is always wider than screen width (enables infinite continuous loop)
  let setMemories = [...displayMemories];
  if (setMemories.length > 0) {
    while (setMemories.length < 8) {
      setMemories = [...setMemories, ...displayMemories];
    }
  }
  const repeatedMemories = [...setMemories, ...setMemories, ...setMemories];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const setInitialScroll = () => {
      const setWidth = container.scrollWidth / 3;
      if (setWidth > 0 && (container.scrollLeft === 0 || isNaN(container.scrollLeft))) {
        container.scrollLeft = setWidth;
      }
    };

    setInitialScroll();
    const timer = setTimeout(setInitialScroll, 300);

    const speed = direction === 'ltr' ? 0.8 : -0.8;

    const animate = () => {
      const isMobileTouch =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches;

      const shouldPause = isDraggingRef.current || (!isMobileTouch && isHoveredRef.current);

      if (container && !shouldPause) {
        if (isNaN(container.scrollLeft)) {
          container.scrollLeft = container.scrollWidth / 3;
        }

        container.scrollLeft += speed;

        const totalWidth = container.scrollWidth;
        const setWidth = totalWidth / 3;

        if (setWidth > 0 && !isNaN(container.scrollLeft)) {
          if (container.scrollLeft >= setWidth * 2) {
            container.scrollLeft -= setWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += setWidth;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      clearTimeout(timer);
    };
  }, [direction, safeMemories]);

  // Handle native scroll wrap-around (works for both native touch swipe and auto-scroll)
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const totalWidth = container.scrollWidth;
    const setWidth = totalWidth / 3;

    if (setWidth > 0 && !isNaN(container.scrollLeft)) {
      if (container.scrollLeft >= setWidth * 2) {
        container.scrollLeft -= setWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += setWidth;
      }
    }
  };

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e) => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    moveDistRef.current = 0;
    container.classList.add('grabbing');
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = false;
    isHoveredRef.current = false;
    container.classList.remove('grabbing');
  };

  const handleMouseUp = () => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = false;
    container.classList.remove('grabbing');
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    moveDistRef.current += Math.abs(walk);
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  // Touch Handlers (Mobile)
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    isHoveredRef.current = false;
    if (e.touches && e.touches[0]) {
      startXRef.current = e.touches[0].clientX;
      if (containerRef.current) {
        scrollLeftRef.current = containerRef.current.scrollLeft;
      }
    }
    moveDistRef.current = 0;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      const dist = Math.abs(e.touches[0].clientX - startXRef.current);
      moveDistRef.current = Math.max(moveDistRef.current, dist);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isHoveredRef.current = false;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      isDraggingRef.current = false;
      isHoveredRef.current = false;
    }, 400);
  };

  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      isHoveredRef.current = true;
    }
  };

  const handlePhotoItemClick = (m) => {
    if (moveDistRef.current < 10 && onPhotoClick) {
      onPhotoClick(m);
    }
  };

  // Render Placeholder Card if NO MEMORIES uploaded yet
  if (displayMemories.length === 0) {
    return (
      <div className={`film-roll-wrapper row-${direction}`}>
        <div className="film-roll-track" style={{ justifyContent: 'center' }}>
          <div className="film-strip">
            <div className="film-frame" style={{ width: '280px', opacity: 0.9 }}>
              <div
                className="film-photo"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(15, 20, 40, 0.9), rgba(30, 40, 70, 0.9))',
                  border: '1px dashed rgba(0, 240, 255, 0.4)',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>📸</div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#00F0FF' }}>
                  Chưa có ảnh kỷ niệm nào
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                  Bấm nút "+ Thêm kỷ niệm" phía trên để chia sẻ bức ảnh đầu tiên nhé! ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`film-roll-wrapper row-${direction}`}>
      <div
        ref={containerRef}
        className="film-roll-track"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="film-strip">
          {repeatedMemories.map((m, idx) => {
            const hasImage = Boolean(m?.imageUrl || m?.image);
            return (
              <div
                className="film-frame"
                key={`${direction}-${m?.id || idx}-${idx}`}
                onClick={() => handlePhotoItemClick(m)}
              >
                <div className={`film-photo ${!hasImage ? 'letter-mode' : ''}`}>
                  {hasImage ? (
                    <>
                      <img
                        src={formatImageUrl(m?.imageUrl || m?.image)}
                        alt={m?.name || m?.title || 'Kỷ niệm'}
                        draggable={false}
                      />
                      <div className="film-photo-info">
                        <span className="film-photo-name">{m?.name || m?.title || 'Kỷ niệm'}</span>
                        <span className="film-photo-caption">{m?.caption || ''}</span>
                      </div>
                    </>
                  ) : (
                    <div className="film-letter-card">
                      <span className="film-letter-seal">💌</span>
                      <span className="film-letter-name">{m?.name || m?.title || 'Lời chúc'}</span>
                      <p className="film-letter-body">
                        {m?.caption ? `“${m.caption}”` : 'Lời chúc kỷ niệm'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
