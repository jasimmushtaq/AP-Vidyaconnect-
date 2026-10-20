// ============================================================================
// AP VIDYACONNECT — "OLD HAT" AMBIENT MESH GRADIENT BACKGROUND
// Palette: #E4AFCB (Rose), #E2C58B (Warm Gold), #B8CBB8 (Sage), #C2CE9C (Olive), #7EDBDC (Turquoise)
// ============================================================================

import React, { useEffect, useRef } from 'react';

export const GovernmentTechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle floating network nodes (dots & connecting lines) - Lightweight & GPU friendly
    const nodeCount = Math.min(14, Math.max(6, Math.floor((width * height) / 90000)));
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    // "OLD HAT" Color Palette RGBs
    const colors = [
      '228, 175, 203', // #E4AFCB (Pastel Rose)
      '226, 197, 139', // #E2C58B (Warm Gold)
      '126, 219, 220', // #7EDBDC (Turquoise)
      '184, 203, 184', // #B8CBB8 (Sage Green)
      '194, 206, 156', // #C2CE9C (Olive Lime)
      '14, 35, 80',    // Navy accent
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.5 + 1.0,
        baseAlpha: Math.random() * 0.2 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: colors[i % colors.length]
      });
    }

    let time = 0;
    let lastFrame = 0;

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Pause when tab is inactive to save 100% CPU/GPU
      if (typeof document !== 'undefined' && document.hidden) return;

      // Throttle to ~30 FPS for silky-smooth performance without draining battery/GPU
      if (timestamp - lastFrame < 33) return;
      lastFrame = timestamp;

      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14, 35, 80, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // 2. Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;

        const alpha = node.baseAlpha + Math.sin(time * node.pulseSpeed * 10 + i) * 0.06;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color}, ${Math.max(0.04, alpha)})`;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Base Layer: OLD HAT Rich Ambient Multi-Stop Mesh Gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#B8CBB8',
          backgroundImage: `
            radial-gradient(circle at 10% 8%, rgba(228, 175, 203, 0.85) 0%, transparent 48%),
            radial-gradient(circle at 92% 8%, rgba(126, 219, 220, 0.85) 0%, transparent 48%),
            radial-gradient(circle at 50% 32%, rgba(226, 197, 139, 0.75) 0%, transparent 52%),
            radial-gradient(circle at 88% 62%, rgba(194, 206, 156, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 8% 88%, rgba(228, 175, 203, 0.7) 0%, transparent 48%),
            radial-gradient(circle at 75% 92%, rgba(226, 197, 139, 0.75) 0%, transparent 50%),
            radial-gradient(circle at 35% 75%, rgba(184, 203, 184, 0.85) 0%, transparent 55%)
          `,
          backgroundBlendMode: 'normal'
        }}
      />

      {/* 2. Soft Luminous White Veil (Clean & Zero GPU lag) */}
      <div className="absolute inset-0 bg-white/55" />

      {/* 3. Subtle Dot Matrix Tech Pattern */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(rgba(14, 35, 80, 0.12) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 4. Minimal Andhra Pradesh Map Silhouette & Coastal Wave Curves (SVG) */}
      <svg
        className="absolute right-0 top-8 w-[680px] lg:w-[860px] h-full max-h-[1400px] opacity-[0.055] text-[#0E2350] pointer-events-none"
        viewBox="0 0 800 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Andhra Pradesh Coastal Silhouette Contour */}
        <path
          d="M 620 40 
             C 600 70, 560 110, 540 160 
             C 520 210, 510 260, 480 320 
             C 450 380, 410 420, 390 480 
             C 370 540, 350 600, 320 660 
             C 290 720, 250 780, 220 840 
             C 190 900, 160 940, 130 980"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 8"
        />

        {/* Coastal Wave Flow Lines */}
        <path
          d="M 660 50 
             C 630 100, 590 150, 570 210 
             C 550 270, 530 320, 500 380 
             C 470 440, 430 490, 410 550 
             C 390 610, 360 670, 340 730 
             C 310 800, 270 860, 240 920"
          stroke="#E2C58B"
          strokeWidth="2"
          strokeDasharray="12 12"
          opacity="0.9"
        />

        <path
          d="M 700 80 
             C 670 140, 620 200, 600 260 
             C 580 320, 560 380, 530 440 
             C 500 500, 460 560, 440 620 
             C 410 700, 370 780, 340 850"
          stroke="#7EDBDC"
          strokeWidth="1.5"
          strokeDasharray="4 10"
          opacity="0.8"
        />

        {/* District Node Hubs */}
        <circle cx="540" cy="160" r="16" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="540" cy="160" r="3" fill="#0E2350" />
        <line x1="540" y1="160" x2="600" y2="120" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />

        <circle cx="430" cy="450" r="24" stroke="#E2C58B" strokeWidth="1.2" strokeDasharray="4 4" />
        <circle cx="430" cy="450" r="4" fill="#E2C58B" />
        <line x1="430" y1="450" x2="520" y2="400" stroke="#E2C58B" strokeWidth="0.75" strokeDasharray="2 4" />

        <circle cx="250" cy="780" r="18" stroke="#7EDBDC" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="250" cy="780" r="3" fill="#7EDBDC" />
        <line x1="250" y1="780" x2="330" y2="720" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
      </svg>

      {/* 5. Subtle Canvas Layer: Animated Drifting Network Nodes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

