import { useEffect, useRef, useCallback } from "react";

/**
 * Premium cinematic animated background — 7 layers:
 *   1. Deep atmospheric gradient base
 *   2. Drifting ambient gradient orbs (6 orbs, varied palette colors)
 *   3. Moving perspective grid with depth
 *   4. Glowing node dots with subtle pulse
 *   5. Canvas particle network with mouse interaction + data pulses
 *   6. Soft glow pulse accents
 *   7. Edge vignette for depth
 *
 * All layers: pointer-events:none, GPU-friendly, prefers-reduced-motion aware.
 * Mobile: reduced particle count, simplified effects.
 */

/* ------------------------------------------------------------------ */
/*  Color palette (matches BugHive accent colors)                      */
/* ------------------------------------------------------------------ */

const PALETTE: Record<string, [number, number, number]> = {
  yellow: [255, 224, 102],
  blue: [127, 191, 255],
  green: [127, 255, 127],
  coral: [255, 159, 127],
  purple: [223, 127, 255],
};

/* ------------------------------------------------------------------ */
/*  Particle canvas — network + mouse reactivity + data pulses         */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  glow: boolean;
  /** pulse animation state for data pulses */
  pulsePhase: number;
  pulseSpeed: number;
  colorKey: string;
}

/** Data pulse traveling along a connection line */
interface DataPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  color: [number, number, number];
  alpha: number;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const colorKeys = Object.keys(PALETTE) as (keyof typeof PALETTE)[];
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const isNode = i < Math.floor(count * 0.18);
    const ck = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: isNode ? 1.8 + Math.random() * 1.5 : 0.6 + Math.random() * 0.8,
      opacity: isNode ? 0.3 + Math.random() * 0.35 : 0.08 + Math.random() * 0.15,
      glow: isNode,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.3 + Math.random() * 0.4,
      colorKey: ck,
    });
  }
  return particles;
}

function ParticleCanvas({ count = 50 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pulsesRef = useRef<DataPulse[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const pulses = pulsesRef.current;
    const mouse = mouseRef.current;
    const dt = 0.016; // ~60fps
    timeRef.current += dt;

    const connectionDist = 140;
    const mouseInfluenceRadius = 150;
    const mouseStrength = 0.3;

    /* update particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* mouse repulsion — subtle push away */
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < mouseInfluenceRadius && mDist > 0) {
        const force = (1 - mDist / mouseInfluenceRadius) * mouseStrength;
        p.vx += (mdx / mDist) * force * dt * 60;
        p.vy += (mdy / mDist) * force * dt * 60;
      }

      /* dampen velocity */
      p.vx *= 0.995;
      p.vy *= 0.995;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      /* pulse phase */
      p.pulsePhase += p.pulseSpeed * dt;

      /* draw glow for node particles */
      if (p.glow) {
        const glowPulse = 0.5 + 0.5 * Math.sin(p.pulsePhase);
        const [r, g, b] = PALETTE[p.colorKey];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.06 * glowPulse})`;
        ctx.fill();
      }

      /* draw particle */
      const [cr, cg, cb] = PALETTE[p.colorKey];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.opacity})`;
      ctx.fill();
    }

    /* draw connections */
    ctx.lineWidth = 0.4;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.08;
          const [cr, cg, cb] = PALETTE[particles[i].colorKey];
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.stroke();
        }
      }
    }

    /* update + draw data pulses */
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pulse = pulses[i];
      pulse.progress += pulse.speed * dt;
      if (pulse.progress >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const from = particles[pulse.fromIdx];
      const to = particles[pulse.toIdx];
      if (!from || !to) continue;

      const px = from.x + (to.x - from.x) * pulse.progress;
      const py = from.y + (to.y - from.y) * pulse.progress;

      /* glow */
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pulse.color[0]}, ${pulse.color[1]}, ${pulse.color[2]}, ${pulse.alpha * 0.15})`;
      ctx.fill();

      /* core */
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pulse.color[0]}, ${pulse.color[1]}, ${pulse.color[2]}, ${pulse.alpha})`;
      ctx.fill();
    }

    /* occasionally spawn a new data pulse */
    if (pulses.length < 4 && Math.random() < 0.005) {
      const i = Math.floor(Math.random() * particles.length);
      /* find a connected neighbor */
      for (let j = 0; j < particles.length; j++) {
        if (i === j) continue;
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < connectionDist) {
          const ck = particles[i].colorKey;
          pulses.push({
            fromIdx: i,
            toIdx: j,
            progress: 0,
            speed: 0.4 + Math.random() * 0.3,
            color: PALETTE[ck],
            alpha: 0.6 + Math.random() * 0.3,
          });
          break;
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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

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
      const divisor = isMobile ? 36000 : 16000;
      const targetCount = Math.min(Math.max(Math.floor(area / divisor), isMobile ? 12 : 20), count);
      particlesRef.current = createParticles(rect.width, rect.height, targetCount);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
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
/*  Glowing node dots                                                  */
/* ------------------------------------------------------------------ */

function GlowingNodes() {
  const nodes = [
    { x: "15%", y: "20%", color: "rgba(255,224,102,0.25)", size: 5 },
    { x: "70%", y: "25%", color: "rgba(127,191,255,0.22)", size: 4 },
    { x: "40%", y: "65%", color: "rgba(127,255,127,0.20)", size: 5 },
    { x: "85%", y: "55%", color: "rgba(255,159,127,0.18)", size: 4 },
    { x: "8%", y: "75%", color: "rgba(223,127,255,0.20)", size: 5 },
    { x: "55%", y: "12%", color: "rgba(255,224,102,0.22)", size: 4 },
    { x: "30%", y: "88%", color: "rgba(127,191,255,0.18)", size: 3 },
    { x: "90%", y: "80%", color: "rgba(127,255,127,0.16)", size: 4 },
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
            animationDelay: `${i * 1.8}s`,
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
      {/* Layer 1 — Deep atmospheric gradient base */}
      <div className="absolute inset-0 nb-bg-base" />

      {/* Layer 2 — Drifting ambient orbs */}
      <div className="absolute inset-0 nb-orbs-layer">
        <div className="nb-orb nb-orb-1" />
        <div className="nb-orb nb-orb-2" />
        <div className="nb-orb nb-orb-3" />
        <div className="nb-orb nb-orb-4" />
        <div className="nb-orb nb-orb-5" />
        <div className="nb-orb nb-orb-6" />
      </div>

      {/* Layer 3 — Moving perspective grid */}
      <div className="absolute inset-0 nb-grid-layer">
        <svg className="w-full h-full" aria-hidden="true">
          <defs>
            <pattern id="nb-grid-h" width="1" height="60" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 10000 0" fill="none" stroke="rgba(255,224,102,0.04)" strokeWidth="0.5" />
            </pattern>
            <pattern id="nb-grid-v" width="60" height="1" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 0 10000" fill="none" stroke="rgba(127,191,255,0.03)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="nb-grid-fade" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="nb-grid-mask">
              <rect width="100%" height="100%" fill="url(#nb-grid-fade)" />
            </mask>
          </defs>
          <g mask="url(#nb-grid-mask)">
            <rect width="100%" height="100%" fill="url(#nb-grid-h)" className="nb-grid-scroll-h" />
            <rect width="100%" height="100%" fill="url(#nb-grid-v)" className="nb-grid-scroll-v" />
          </g>
          {/* Intersection dots */}
          <g mask="url(#nb-grid-mask)" opacity="0.5">
            <pattern id="nb-grid-dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1" fill="rgba(255,224,102,0.08)" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#nb-grid-dots)" />
          </g>
        </svg>
      </div>

      {/* Layer 4 — Glowing nodes */}
      <GlowingNodes />

      {/* Layer 5 — Canvas particle network */}
      <ParticleCanvas count={particleCount} />

      {/* Layer 6 — Soft glow accents */}
      <div className="absolute inset-0 nb-glow-layer">
        <div className="nb-glow-pulse nb-glow-pulse-1" />
        <div className="nb-glow-pulse nb-glow-pulse-2" />
      </div>

      {/* Layer 7 — Edge vignette */}
      <div className="absolute inset-0 nb-vignette" />
    </div>
  );
}
