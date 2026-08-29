import { useEffect, useRef, useCallback } from "react";

/**
 * Premium animated background with 5 layers:
 *   1. Subtle radial gradient base
 *   2. Drifting ambient gradient orbs
 *   3. Faint grid / circuit pattern
 *   4. Floating particles with connecting lines (canvas)
 *   5. Soft glow pulse accents
 *
 * All layers are pointer-events:none, GPU-friendly, and respect
 * prefers-reduced-motion.
 */

/* ------------------------------------------------------------------ */
/*  Particle canvas — tiny drifting dots + faint connecting lines      */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.2,
      opacity: 0.15 + Math.random() * 0.25,
    });
  }
  return particles;
}

function ParticleCanvas({ count = 50 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const connectionDist = 140;

    /* update + draw particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      /* wrap around edges */
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26, 26, 26, ${p.opacity})`;
      ctx.fill();
    }

    /* draw connections */
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(26, 26, 26, ${alpha})`;
          ctx.stroke();
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mql.matches;

    const canvas = canvasRef.current;
    if (!canvas || reducedMotion.current) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      /* recalculate particle count based on viewport */
      const area = rect.width * rect.height;
      const targetCount = Math.min(Math.max(Math.floor(area / 18000), 25), count);
      particlesRef.current = createParticles(rect.width, rect.height, targetCount);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [count, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

export function AnimatedBackground({
  particleCount = 50,
  className = "",
}: {
  particleCount?: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Layer 1 — Soft radial gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,224,102,0.06)_0%,transparent_60%)]" />

      {/* Layer 2 — Drifting ambient orbs */}
      <div className="absolute inset-0 nb-orbs-layer">
        <div className="nb-orb nb-orb-1" />
        <div className="nb-orb nb-orb-2" />
        <div className="nb-orb nb-orb-3" />
      </div>

      {/* Layer 3 — Subtle grid / circuit pattern */}
      <svg className="absolute inset-0 w-full h-full nb-grid-layer" aria-hidden="true">
        <defs>
          <pattern id="nb-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="rgba(26,26,26,0.04)"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1.5" fill="rgba(26,26,26,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nb-circuit)" />
      </svg>

      {/* Layer 4 — Particle network (canvas) */}
      <ParticleCanvas count={particleCount} />

      {/* Layer 5 — Soft glow accent */}
      <div className="absolute inset-0 nb-glow-layer">
        <div className="nb-glow-pulse" />
      </div>
    </div>
  );
}
