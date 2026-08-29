import { useEffect, useRef, useCallback } from "react";

/**
 * Premium animated background — 7 layers:
 *   1. Soft radial gradient base
 *   2. Drifting ambient gradient orbs (5 orbs, varied colors)
 *   3. Subtle grid / circuit pattern
 *   4. CSS floating particles (tiny, slow, decorative)
 *   5. Glowing node dots with subtle pulse
 *   6. Canvas particle network with connecting lines
 *   7. Soft glow pulse accents
 *
 * All layers: pointer-events:none, GPU-friendly, prefers-reduced-motion aware.
 * Mobile: reduced particle count, frozen CSS particles.
 */

/* ------------------------------------------------------------------ */
/*  Particle canvas — drifting dots + connecting lines                 */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  /** optional glow for "node" particles */
  glow: boolean;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const isNode = i < Math.floor(count * 0.15); // first 15% are glowing nodes
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: isNode ? 2 + Math.random() * 1.5 : 0.8 + Math.random() * 1,
      opacity: isNode ? 0.25 + Math.random() * 0.2 : 0.1 + Math.random() * 0.18,
      glow: isNode,
    });
  }
  return particles;
}

function ParticleCanvas({ count = 50 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const connectionDist = 130;

    /* update + draw particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      /* draw glow for node particles */
      if (p.glow) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${p.opacity * 0.12})`;
        ctx.fill();
      }

      /* draw particle */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26, 26, 26, ${p.opacity})`;
      ctx.fill();
    }

    /* draw connections */
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.06;
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
    if (mql.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      const area = rect.width * rect.height;
      const isMobile = rect.width < 768;
      const divisor = isMobile ? 32000 : 18000;
      const targetCount = Math.min(Math.max(Math.floor(area / divisor), isMobile ? 15 : 25), count);
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
/*  CSS floating particles — tiny decorative dots                      */
/* ------------------------------------------------------------------ */

function CSSParticles() {
  /* Static positions via inline styles — no JS needed */
  const dots = [
    { x: "12%", y: "18%", s: 3, o: 0.12, d: 22, delay: 0 },
    { x: "78%", y: "25%", s: 2, o: 0.09, d: 28, delay: -8 },
    { x: "35%", y: "65%", s: 2.5, o: 0.1, d: 25, delay: -4 },
    { x: "88%", y: "72%", s: 2, o: 0.08, d: 30, delay: -12 },
    { x: "55%", y: "12%", s: 3, o: 0.11, d: 20, delay: -6 },
    { x: "22%", y: "82%", s: 2, o: 0.09, d: 26, delay: -10 },
    { x: "65%", y: "45%", s: 2.5, o: 0.1, d: 24, delay: -2 },
    { x: "8%", y: "55%", s: 2, o: 0.08, d: 32, delay: -14 },
    { x: "45%", y: "88%", s: 3, o: 0.1, d: 21, delay: -7 },
    { x: "92%", y: "40%", s: 2, o: 0.09, d: 27, delay: -11 },
    { x: "28%", y: "35%", s: 2.5, o: 0.11, d: 23, delay: -3 },
    { x: "72%", y: "85%", s: 2, o: 0.08, d: 29, delay: -9 },
  ];

  return (
    <div className="absolute inset-0 nb-css-particles" aria-hidden="true">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="nb-css-particle"
          style={{
            left: dot.x,
            top: dot.y,
            width: dot.s,
            height: dot.s,
            opacity: dot.o,
            animationDuration: `${dot.d}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glowing node dots — subtle pulsing accent points                   */
/* ------------------------------------------------------------------ */

function GlowingNodes() {
  const nodes = [
    { x: "20%", y: "22%", color: "rgba(255,224,102,0.15)", size: 6 },
    { x: "75%", y: "30%", color: "rgba(127,191,255,0.12)", size: 5 },
    { x: "45%", y: "70%", color: "rgba(127,255,127,0.10)", size: 5 },
    { x: "85%", y: "60%", color: "rgba(255,159,127,0.10)", size: 4 },
    { x: "10%", y: "80%", color: "rgba(223,127,255,0.10)", size: 5 },
    { x: "60%", y: "15%", color: "rgba(255,224,102,0.12)", size: 4 },
  ];

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {nodes.map((node, i) => (
        <div
          key={i}
          className="nb-glowing-node"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
            background: node.color,
            animationDelay: `${i * 2.5}s`,
          }}
        />
      ))}
    </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,224,102,0.05)_0%,transparent_55%)]" />

      {/* Layer 2 — Drifting ambient orbs */}
      <div className="absolute inset-0 nb-orbs-layer">
        <div className="nb-orb nb-orb-1" />
        <div className="nb-orb nb-orb-2" />
        <div className="nb-orb nb-orb-3" />
        <div className="nb-orb nb-orb-4" />
        <div className="nb-orb nb-orb-5" />
      </div>

      {/* Layer 3 — Subtle grid / circuit pattern */}
      <svg className="absolute inset-0 w-full h-full nb-grid-layer" aria-hidden="true">
        <defs>
          <pattern id="nb-circuit" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="rgba(26,26,26,0.035)"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="1.2" fill="rgba(26,26,26,0.05)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nb-circuit)" />
      </svg>

      {/* Layer 4 — CSS floating particles */}
      <CSSParticles />

      {/* Layer 5 — Glowing node dots */}
      <GlowingNodes />

      {/* Layer 6 — Particle network (canvas) */}
      <ParticleCanvas count={particleCount} />

      {/* Layer 7 — Soft glow accent */}
      <div className="absolute inset-0 nb-glow-layer">
        <div className="nb-glow-pulse nb-glow-pulse-1" />
        <div className="nb-glow-pulse nb-glow-pulse-2" />
      </div>
    </div>
  );
}
