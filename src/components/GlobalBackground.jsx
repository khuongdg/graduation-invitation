'use client';

import React from 'react';

export default function GlobalBackground({ parallaxOffset }) {
  return (
    <div className="global-liquid-bg">
      {/* Volumetric Glow Beams */}
      <div
        className="volumetric-light-left-global"
        style={{
          transform: `translate(${parallaxOffset.x * -40}px, ${parallaxOffset.y * -40}px)`
        }}
      ></div>
      <div
        className="volumetric-light-right-global"
        style={{
          transform: `translate(${parallaxOffset.x * -45}px, ${parallaxOffset.y * -45}px)`
        }}
      ></div>
      <div
        className="volumetric-light-center-global"
        style={{
          transform: `translate(${parallaxOffset.x * -20}px, ${parallaxOffset.y * -20}px)`
        }}
      ></div>

      {/* Cosmic 3D Liquid Planets with Cosmic Rings */}
      <div
        className="planet-container-saturn"
        style={{
          transform: `translate(${parallaxOffset.x * 70}px, ${parallaxOffset.y * 70}px)`
        }}
      >
        <div className="planet-sphere-saturn"></div>
        <div className="planet-cosmic-ring"></div>
      </div>

      <div
        className="planet-container-gas"
        style={{
          transform: `translate(${parallaxOffset.x * 55}px, ${parallaxOffset.y * 55}px)`
        }}
      >
        <div className="planet-sphere-gas"></div>
      </div>

      {/* Sparkling 4-Point Galaxy Stars */}
      <div
        className="sparkle-star-4point"
        style={{ top: '14%', left: '18%', animationDelay: '0s' }}
      ></div>
      <div
        className="sparkle-star-4point sparkle-red-4point"
        style={{ top: '22%', right: '26%', animationDelay: '1.2s' }}
      ></div>
      <div
        className="sparkle-star-4point"
        style={{ top: '62%', left: '14%', animationDelay: '2.4s' }}
      ></div>
      <div
        className="sparkle-star-4point sparkle-red-4point"
        style={{ top: '74%', right: '16%', animationDelay: '1.8s' }}
      ></div>
    </div>
  );
}
