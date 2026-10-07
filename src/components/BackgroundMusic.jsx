'use client';

import React, { useState, useRef, useEffect } from 'react';

// Inline vector SVG icons
function Volume2Icon({ style, className = '' }) {
  return (
    <svg
      className={className}
      style={{ width: '22px', height: '22px', ...style }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeXIcon({ style, className = '' }) {
  return (
    <svg
      className={className}
      style={{ width: '22px', height: '22px', ...style }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const audioUrl =
    process.env.NEXT_PUBLIC_MUSIC_URL || '/music/Kid.mp3' ||
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-116186.mp3';

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio autoplay prevented:', err));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;

    // 1. Attempt initial autoplay on mount
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setIsPlaying(false);
      });

    // 2. Fallback: play on first user interaction if browser policy blocked autoplay
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />

      {/* Liquid Glass Apple Vision Pro Audio Toggle Button */}
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        className="bg-music-btn-glass"
        style={{
          position: 'relative',
          padding: '14px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isPlaying
            ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.22), rgba(112, 0, 255, 0.22))'
            : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isPlaying ? '1.5px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.22)',
          color: isPlaying ? '#00F0FF' : 'rgba(255, 255, 255, 0.75)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPlaying
            ? '0 0 25px rgba(0, 240, 255, 0.45), inset 0 0 15px rgba(255, 255, 255, 0.3)'
            : '0 8px 25px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isPlaying ? (
          <>
            <Volume2Icon className="animate-pulse" />
            {/* Top-Right Music Note Badge (Thay thế nốt chấm vàng) */}
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00F0FF, #7000FF)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 0 12px #00F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                animation: 'noteFloat 1.8s infinite ease-in-out alternate'
              }}
            >
              🎵
            </span>
          </>
        ) : (
          <VolumeXIcon style={{ opacity: 0.65 }} />
        )}
      </button>

      <style jsx>{`
        .bg-music-btn-glass:hover {
          transform: scale(1.08);
          border-color: #00F0FF !important;
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.4) !important;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes noteFloat {
          0% {
            transform: scale(0.95) translateY(0);
            box-shadow: 0 0 8px #00F0FF;
          }
          100% {
            transform: scale(1.15) translateY(-3px);
            box-shadow: 0 0 16px #00F0FF, 0 0 25px rgba(112, 0, 255, 0.8);
          }
        }
      `}</style>
    </div>
  );
}
