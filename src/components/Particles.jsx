'use client';

import React, { useEffect, useRef } from 'react';

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const particleCount = 45;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 0.5 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.alpha = init ? Math.random() * 0.4 : 0;
        this.maxAlpha = Math.random() * 0.6 + 0.2;
        this.colorType = Math.floor(Math.random() * 3); // 0: White, 1: Glowing Blue, 2: Warm gold
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Fade in when starting, fade out near the top
        if (this.y < canvas.height * 0.25) {
          this.alpha -= 0.008;
        } else if (this.alpha < this.maxAlpha) {
          this.alpha += 0.005;
        }

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10 || this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        let color = `rgba(255, 255, 255, ${this.alpha})`;
        if (this.colorType === 1) {
          color = `rgba(128, 243, 255, ${this.alpha})`;
        } else if (this.colorType === 2) {
          color = `rgba(255, 250, 204, ${this.alpha})`; // Magical warm gold
        }
        
        ctx.fillStyle = color;
        ctx.shadowBlur = this.size * 1.5;
        ctx.shadowColor = this.colorType === 1 ? '#00f0ff' : '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}
