import { useMemo } from "react";

interface Shape {
  id: number;
  type: "square" | "circle" | "cross" | "triangle" | "ring" | "dot";
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
}

const COLORS = [
  "#FFE066",
  "#7FBFFF",
  "#7FFF7F",
  "#FF9F7F",
  "#DF7FFF",
  "#FFFFFF",
];

function generateShapes(count: number, seed: number): Shape[] {
  const shapes: Shape[] = [];
  const types: Shape["type"][] = ["square", "circle", "cross", "triangle", "ring", "dot"];

  for (let i = 0; i < count; i++) {
    // Simple seeded pseudo-random
    const r = Math.sin(seed + i * 127.1) * 43758.5453;
    const rand = r - Math.floor(r);
    const r2 = Math.sin(seed + i * 269.5) * 43758.5453;
    const rand2 = r2 - Math.floor(r2);
    const r3 = Math.sin(seed + i * 419.2) * 43758.5453;
    const rand3 = r3 - Math.floor(r3);

    shapes.push({
      id: i,
      type: types[Math.floor(rand * types.length)],
      x: rand2 * 100,
      y: rand3 * 100,
      size: 12 + rand * 36,
      color: COLORS[Math.floor(rand * COLORS.length)],
      duration: 18 + rand2 * 30,
      delay: rand3 * -20,
      rotation: rand * 360,
    });
  }
  return shapes;
}

function ShapeSVG({ shape }: { shape: Shape }) {
  const { type, size, color } = shape;

  switch (type) {
    case "square":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            fill={color}
            stroke="#1A1A1A"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="17"
            fill={color}
            stroke="#1A1A1A"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "cross":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <rect x="15" y="2" width="10" height="36" fill="#1A1A1A" />
          <rect x="2" y="15" width="36" height="10" fill="#1A1A1A" />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <polygon
            points="20,2 38,38 2,38"
            fill={color}
            stroke="#1A1A1A"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "ring":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="3"
          />
        </svg>
      );
    case "dot":
      return (
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="#1A1A1A" />
        </svg>
      );
  }
}

export function AnimatedBackground({
  count = 18,
  seed = 42,
  className = "",
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const shapes = useMemo(() => generateShapes(count, seed), [count, seed]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute nb-float"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
            transform: `rotate(${shape.rotation}deg)`,
            opacity: 0.35,
          }}
        >
          <ShapeSVG shape={shape} />
        </div>
      ))}

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern id="nb-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nb-grid)" />
      </svg>

      {/* Moving gradient accent */}
      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] nb-gradient-pulse opacity-[0.07]" />
    </div>
  );
}
