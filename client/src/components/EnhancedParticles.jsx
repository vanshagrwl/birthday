import { useMemo, useEffect, useRef } from "react";

export function FloatingPetals({ active = true, count = 25 }) {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 12 + Math.random() * 8,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 40,
      rotation: Math.random() * 360,
      opacity: 0.4 + Math.random() * 0.4,
      color: Math.random() > 0.7 ? '#ff7eb3' : Math.random() > 0.5 ? '#ff5c8a' : '#e93d7a'
    }));
  }, [count]);

  if (!active) return null;

  return (
    <div className="floating-petals" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="floating-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
            ['--dur']: `${petal.duration}s`,
            ['--delay']: `${petal.delay}s`,
            ['--drift']: `${petal.drift}px`,
            ['--rotation']: `${petal.rotation}deg`,
            ['--color']: petal.color,
          }}
        />
      ))}
    </div>
  );
}

export function SparkleEffects({ active = true, count = 15 }) {
  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }));
  }, [count]);

  if (!active) return null;

  return (
    <div className="sparkle-effects" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: sparkle.size,
            height: sparkle.size,
            ['--dur']: `${sparkle.duration}s`,
            ['--delay']: `${sparkle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function MagicDustTrail({ active = false, position = { x: 0, y: 0 } }) {
  const trailRef = useRef([]);

  useEffect(() => {
    if (!active) return;

    const trail = {
      x: position.x,
      y: position.y,
      timestamp: Date.now()
    };

    trailRef.current.push(trail);

    // Keep only recent trail points
    const now = Date.now();
    trailRef.current = trailRef.current.filter(t => now - t.timestamp < 1000);

    const cleanup = setTimeout(() => {
      trailRef.current = trailRef.current.filter(t => t !== trail);
    }, 1000);

    return () => clearTimeout(cleanup);
  }, [active, position]);

  if (!active || trailRef.current.length === 0) return null;

  return (
    <div className="magic-dust-trail" aria-hidden="true">
      {trailRef.current.map((point, i) => (
        <div
          key={i}
          className="dust-particle"
          style={{
            left: point.x,
            top: point.y,
            opacity: (trailRef.current.length - i) / trailRef.current.length,
          }}
        />
      ))}
    </div>
  );
}