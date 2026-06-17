'use client';

import React, { useEffect, useRef } from 'react';

export default function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      opacitySpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const maxParticles = 60;
    
    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random(),
        opacitySpeed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, index) => {
        // Move particle
        p.y += p.speedY;
        p.x += p.speedX;
        
        // Update opacity
        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.8 || p.opacity < 0.1) {
          p.opacitySpeed = -p.opacitySpeed;
        }
        
        // Keep in bounds
        if (p.opacity < 0) p.opacity = 0;
        if (p.opacity > 1) p.opacity = 1;
        
        // Recycle particle when it goes off screen
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
          p.opacity = 0.1;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width;
        }

        // Draw particle with golden glowing gradient
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.5)';
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
