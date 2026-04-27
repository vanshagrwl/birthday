import { useEffect, useRef } from "react";

export function Confetti({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random() * -0.2,
      r: 2 + Math.random() * 4,
      vy: 1.2 + Math.random() * 2.6,
      vx: -1.1 + Math.random() * 2.2,
      rot: Math.random() * Math.PI * 2,
      vr: -0.12 + Math.random() * 0.24,
      hue: 320 + Math.random() * 80,
    }));

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy / h;
        p.x += p.vx / w;
        p.rot += p.vr;
        if (p.y > 1.05) {
          p.y = -0.05;
          p.x = Math.random();
          p.vy = 1.2 + Math.random() * 2.6;
        }
        const x = p.x * w;
        const y = p.y * h;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 62%, 0.9)`;
        ctx.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
}
