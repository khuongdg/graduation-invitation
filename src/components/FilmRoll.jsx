'use client';

import React, { useEffect, useRef } from 'react';

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
        const currentSetWidth = totalWidth / 3;

        if (currentSetWidth > 0 && !isNaN(container.scrollLeft)) {
          if (container.scrollLeft >= currentSetWidth * 2) {
            container.scrollLeft -= currentSetWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += currentSetWidth;
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

  // Mouse Drag Handlers
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

    const currentSetWidth = container.scrollWidth / 3;
    if (currentSetWidth > 0 && !isNaN(container.scrollLeft)) {
      if (container.scrollLeft >= currentSetWidth * 2) {
        container.scrollLeft -= currentSetWidth;
        startXRef.current = e.pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += currentSetWidth;
        startXRef.current = e.pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      }
    }
  };

  // Touch Handlers for Mobile (Fix e.touches[0].pageX NaN bug)
  const handleTouchStart = (e) => {
    const container = containerRef.current;
    if (!container || !e.touches || e.touches.length !== 1) return;
    isDraggingRef.current = true;
    moveDistRef.current = 0;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;

    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !e.touches || e.touches.length !== 1) return;
    const container = containerRef.current;
    if (!container) return;
    const pageX = e.touches[0].pageX;
    const x = pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    moveDistRef.current += Math.abs(walk);
    container.scrollLeft = scrollLeftRef.current - walk;

    const currentSetWidth = container.scrollWidth / 3;
    if (currentSetWidth > 0 && !isNaN(container.scrollLeft)) {
      if (container.scrollLeft >= currentSetWidth * 2) {
        container.scrollLeft -= currentSetWidth;
        startXRef.current = pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += currentSetWidth;
        startXRef.current = pageX - container.offsetLeft;
        scrollLeftRef.current = container.scrollLeft;
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      isHoveredRef.current = false;
    }, 500);
  };

  const handleMouseEnter = (e) => {
    // Only set hover pause for real mouse pointer (ignore mobile synthetic touch hover)
    if (e.pointerType !== 'touch') {
      isHoveredRef.current = true;
    }
  };

  const handlePhotoItemClick = (m) => {
    if (moveDistRef.current < 10 && onPhotoClick) {
      onPhotoClick(m);
    }
  };

  const repeatedMemories = [...displayMemories, ...displayMemories, ...displayMemories];

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
