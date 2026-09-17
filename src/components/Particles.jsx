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
    let shootingStars = [];

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 65;

    const resizeCanvas = () => {
      if (!canvas) return;
      const parent = canvas.parentElement || (typeof document !== 'undefined' ? document.body : null);
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 800);
      canvas.height = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 600);
    };

    resizeCanvas();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resizeCanvas);
    }

    class StarParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        const w = canvas.width || 800;
        const h = canvas.height || 600;
        this.x = Math.random() * w;
        this.y = init ? Math.random() * h : h + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.alpha = init ? Math.random() * 0.7 : 0;
        this.maxAlpha = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
        this.colorType = Math.floor(Math.random() * 4);
      }

      update() {
        const w = canvas.width || 800;
        const h = canvas.height || 600;
        this.y += this.speedY;
        this.x += this.speedX;

        // Twinkling effect
        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha >= this.maxAlpha) {
          this.alpha = this.maxAlpha;
          this.twinkleDir = -1;
        } else if (this.alpha <= 0.1) {
          this.alpha = 0.1;
          this.twinkleDir = 1;
        }

        if (this.y < -10 || this.x < -10 || this.x > w + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        let color = `rgba(255, 255, 255, ${this.alpha})`;
        if (this.colorType === 1) {
          color = `rgba(0, 240, 255, ${this.alpha})`;
        } else if (this.colorType === 2) {
          color = `rgba(255, 42, 85, ${this.alpha * 0.85})`;
        } else if (this.colorType === 3) {
          color = `rgba(255, 215, 0, ${this.alpha * 0.9})`;
        }

        ctx.fillStyle = color;
        // Skip shadowBlur on mobile for 60fps mobile GPU rendering
        if (!isMobile) {
          ctx.shadowBlur = this.size * 2;
          ctx.shadowColor = this.colorType === 1 ? '#00f0ff' : this.colorType === 2 ? '#ff2a55' : '#ffffff';
        }
        ctx.fill();
        if (!isMobile) {
          ctx.shadowBlur = 0;
        }
      }
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        const w = canvas.width || 800;
        const h = canvas.height || 600;
        this.x = Math.random() * w * 1.2;
        this.y = Math.random() * h * 0.5;
        this.len = Math.random() * 80 + 40;
        this.speed = Math.random() * 6 + 4;
        this.size = Math.random() * 1.5 + 1;
        this.life = 0;
        this.maxLife = Math.random() * 40 + 30;
        this.active = false;
        this.wait = Math.random() * 200 + 100;
      }

      update() {
        if (!this.active) {
          this.wait--;
          if (this.wait <= 0) {
            this.active = true;
          }
          return;
        }

        this.x -= this.speed * 1.2;
        this.y += this.speed * 0.8;
        this.life++;

        if (this.life >= this.maxLife) {
          this.reset();
        }
      }

      draw() {
        if (!this.active) return;
        const opacity = 1 - this.life / this.maxLife;

        const tailX = this.x + this.len * 1.2;
        const tailY = this.y - this.len * 0.8;

        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        grad.addColorStop(0.3, `rgba(0, 240, 255, ${opacity * 0.7})`);
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.lineWidth = this.size;
        ctx.strokeStyle = grad;
        ctx.stroke();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new StarParticle());
    }

    const starCount = isMobile ? 1 : 3;
    for (let i = 0; i < starCount; i++) {
      shootingStars.push(new ShootingStar());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width || 800, canvas.height || 600);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      shootingStars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', resizeCanvas);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}
