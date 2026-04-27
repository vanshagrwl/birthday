import { useMemo } from "react";

export function HeartsBackground({ className = "" }) {
  const hearts = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + (i % 7) * 13) % 100}%`,
      size: 10 + (i % 5) * 5,
      duration: 9 + (i % 6) * 1.4,
      delay: (i * 0.35) % 8,
      drift: (i % 5) - 2,
      opacity: 0.35 + (i % 4) * 0.12,
    }));
  }, []);

  return (
    <div className={`hearts-bg ${className}`} aria-hidden="true">
      <div className="hearts-bg__glow" />
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-float"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            ["--dur"]: `${h.duration}s`,
            ["--delay"]: `${h.delay}s`,
            ["--drift"]: `${h.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
