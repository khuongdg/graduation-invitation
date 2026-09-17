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

  const safeMemories = Array.isArray(memories) ? memories : [];
  const displayMemories = direction === 'rtl' ? [...safeMemories].reverse() : safeMemories;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const setWidth = container.scrollWidth / 3;
    if (setWidth > 0 && container.scrollLeft === 0) {
      container.scrollLeft = setWidth;
    }

    const speed = direction === 'ltr' ? 0.8 : -0.8;

    const animate = () => {
      if (container && !isDraggingRef.current && !isHoveredRef.current) {
        container.scrollLeft += speed;

        const totalWidth = container.scrollWidth;
        const currentSetWidth = totalWidth / 3;

        if (currentSetWidth > 0) {
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
    };
  }, [direction, safeMemories]);

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
    if (currentSetWidth > 0) {
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

  const handlePhotoItemClick = (m) => {
    if (moveDistRef.current < 8 && onPhotoClick) {
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
        onMouseEnter={() => (isHoveredRef.current = true)}
        onTouchStart={() => (isHoveredRef.current = true)}
        onTouchEnd={() => (isHoveredRef.current = false)}
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
