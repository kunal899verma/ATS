"use client";

import { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number; y: number;
  vx: number; vy: number;
  color: string; size: number;
  life: number; maxLife: number;
  rotation: number; rotSpeed: number;
}

export default function ScoreConfetti({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#00D9FF", "#6366F1", "#0FFF50", "#FFB300", "#8B5CF6", "#EC4899", "#06B6D4", "#A855F7"];
    const particles: ConfettiParticle[] = [];
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;

    for (let i = 0; i < 180; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 14 + 5;
      const maxLife = 90 + Math.random() * 50;
      particles.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 2,
        life: 0,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.life >= p.maxLife) return;
        alive = true;
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;

        const opacity = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Draw a small rectangle (confetti shape)
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      ctx.globalAlpha = 1;
      if (alive) animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
      className="pointer-events-none"
    />
  );
}
