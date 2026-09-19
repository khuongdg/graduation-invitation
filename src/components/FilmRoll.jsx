'use client';

import React, { useEffect, useRef } from 'react';

export default function FilmRoll({ memories = [], direction = 'ltr', onPhotoClick }) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isHorizontalSwipeRef = useRef(null);
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
      if (container && !isDraggingRef.current && !isHoveredRef.current) {
        if (isNaN(container.scrollLeft)) {
          container.scrollLeft = container.scrollWidth / 3;
        }

        container.scrollLeft += speed;

        const totalWidth = container.scrollWidth;
        const setWidth = totalWidth / 3;

        if (setWidth > 0 && !isNaN(container.scrollLeft)) {
          // Infinite continuous 1-way loop (never hits end point)
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

  // Non-passive Touch Listener for Mobile Devices (Infinite 1:1 Smooth Touch Drag)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      isDraggingRef.current = true;
      moveDistRef.current = 0;
      isHorizontalSwipeRef.current = null;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      scrollLeftRef.current = container.scrollLeft;

      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current || !e.touches || e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startXRef.current;
      const deltaY = currentY - startYRef.current;

      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 4) {
          isHorizontalSwipeRef.current = true;
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 4) {
          isHorizontalSwipeRef.current = false;
        }
      }

      if (isHorizontalSwipeRef.current === true) {
        if (e.cancelable) e.preventDefault();
        moveDistRef.current += Math.abs(deltaX);
        container.scrollLeft = scrollLeftRef.current - deltaX;

        const totalWidth = container.scrollWidth;
        const setWidth = totalWidth / 3;
        if (setWidth > 0 && !isNaN(container.scrollLeft)) {
          // Infinite continuous wrap around during touch drag
          if (container.scrollLeft >= setWidth * 2) {
            container.scrollLeft -= setWidth;
            startXRef.current = currentX;
            scrollLeftRef.current = container.scrollLeft;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += setWidth;
            startXRef.current = currentX;
            scrollLeftRef.current = container.scrollLeft;
          }
        }
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      isHorizontalSwipeRef.current = null;
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
        isHoveredRef.current = false;
      }, 400);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // Mouse Drag Handlers (Desktop Infinite Drag)
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

    const totalWidth = container.scrollWidth;
    const setWidth = totalWidth / 3;
    if (setWidth > 0 && !isNaN(container.scrollLeft)) {
      if (container.scrollLeft >= setWidth * 2) {
        container.scrollLeft -= setWidth;
        startXRef.current = e.pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += setWidth;
        startXRef.current = e.pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      }
    }
  };

  const handleMouseEnter = (e) => {
    if (e.pointerType !== 'touch') {
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
                  Bấm nút "+ Add Memory" phía trên để chia sẻ bức ảnh đầu tiên nhé! ✨
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
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
      >
        <div className="film-strip">
          {repeatedMemories.map((m, idx) => (
            <div
              className="film-frame"
              key={`${direction}-${m?.id || idx}-${idx}`}
              onClick={() => handlePhotoItemClick(m)}
            >
              <div className="film-photo">
                <img src={m?.imageUrl || m?.image || '/assets/test.JPG'} alt={m?.name || m?.title || 'Kỷ niệm'} draggable={false} />
                <div className="film-photo-info">
                  <span className="film-photo-name">{m?.name || m?.title || 'Kỷ niệm'}</span>
                  <span className="film-photo-caption">{m?.caption || ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
