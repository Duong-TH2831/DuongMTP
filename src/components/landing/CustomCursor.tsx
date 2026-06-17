'use client';

import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
    };

    // Listen to hover states on interactive items
    const handleHoverStart = () => setIsHovered(true);
    const handleHoverEnd = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateHoverListeners = () => {
      const links = document.querySelectorAll('a, button, select, input, [role="button"]');
      links.forEach((link) => {
        link.addEventListener('mouseenter', handleHoverStart);
        link.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    // Update listeners after render
    updateHoverListeners();

    // Set up MutationObserver to bind to newly added elements
    const observer = new MutationObserver(updateHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
    };
  }, []);

  // Animate trail position with lag
  useEffect(() => {
    let animationId: number;
    
    const updateTrail = () => {
      setTrailPosition((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationId = requestAnimationFrame(updateTrail);
    };
    
    updateTrail();
    
    return () => cancelAnimationFrame(animationId);
  }, [position]);

  if (isHidden) return null;

  // Simple responsive check: hide custom cursor on mobile touch screens
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
    return null;
  }

  return (
    <>
      <div
        className="custom-cursor-dot"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
          transition: 'transform 0.15s ease',
        }}
      />
      <div
        className="custom-cursor-ring"
        style={{
          left: `${trailPosition.x}px`,
          top: `${trailPosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.8 : 1})`,
          borderColor: isHovered ? '#c9a84c' : 'rgba(201, 168, 76, 0.4)',
          backgroundColor: isHovered ? 'rgba(201, 168, 76, 0.05)' : 'transparent',
          transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        }}
      />
    </>
  );
}
