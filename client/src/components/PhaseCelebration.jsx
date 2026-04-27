import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ageBreakdown } from "../utils/age.js";

export function PhaseCelebration({ onContinue }) {
  const [tick, setTick] = useState(0);
  const parts = useMemo(() => ageBreakdown(), [tick]);
  const counters = useMemo(
    () => [
      { key: "years", label: "Years", value: parts.years },
      { key: "months", label: "Months", value: parts.months },
      { key: "days", label: "Days", value: parts.days },
      { key: "hours", label: "Hours", value: parts.hours },
      { key: "minutes", label: "Minutes", value: parts.minutes },
      { key: "seconds", label: "Seconds", value: parts.seconds },
    ],
    [parts]
  );

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div className="celebration celebration--interactive luxe-celebration-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-panel celebration-card luxe-glass-card luxe-celebration-card">
        <div className="luxe-panda-peek" aria-hidden="true">
          <motion.svg viewBox="0 0 180 140" className="luxe-panda-svg" initial={{ y: 12 }} animate={{ y: [12, 4, 12] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}>
            <ellipse cx="90" cy="120" rx="52" ry="18" fill="rgba(45,16,41,0.22)" />
            <circle cx="58" cy="48" r="18" fill="#1b0f1a" />
            <circle cx="122" cy="48" r="18" fill="#1b0f1a" />
            <ellipse cx="90" cy="72" rx="52" ry="42" fill="#fff6ff" />
            <ellipse cx="72" cy="74" rx="14" ry="12" fill="#251628" />
            <ellipse cx="108" cy="74" rx="14" ry="12" fill="#251628" />
            <motion.ellipse cx="72" cy="74" rx="4.4" ry="4.4" fill="#fff" animate={{ scaleY: [1, 1, 0.12, 1, 1] }} transition={{ duration: 4, times: [0, 0.42, 0.47, 0.54, 1], repeat: Infinity }} />
            <motion.ellipse cx="108" cy="74" rx="4.4" ry="4.4" fill="#fff" animate={{ scaleY: [1, 1, 0.12, 1, 1] }} transition={{ duration: 4, times: [0, 0.42, 0.47, 0.54, 1], repeat: Infinity }} />
            <ellipse cx="90" cy="90" rx="9" ry="7" fill="#1c101b" />
            <path d="M81 99c3 4 5 6 9 6s6-2 9-6" fill="none" stroke="#1c101b" strokeWidth="3.2" strokeLinecap="round" />
          </motion.svg>
        </div>

        <p className="subtle luxe-subtext" style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>
          Vanshika — Panda mode: <span style={{ fontStyle: "italic" }}>activated</span>
        </p>

        <div className="age-grid luxe-age-grid" aria-live="polite">
          {counters.map((counter, idx) => (
            <motion.div
              key={counter.key}
              className="age-card luxe-age-card luxe-age-card-tilt"
              initial={{ opacity: 0, y: 18, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: idx * 0.1 }}
              whileHover={{ rotateX: -5, rotateY: 7, y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div className="age-num" key={`${counter.key}-${tick}`} initial={{ scale: 0.96 }} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 0.45, ease: "easeInOut" }}>
                {counter.value}
              </motion.div>
              <div className="age-label">{counter.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="celebration-actions" style={{ position: "static", marginTop: 18, paddingTop: 0, paddingBottom: 0, background: "none", backdropFilter: "none" }}>
          <button type="button" className="btn btn-primary luxe-primary-btn" onClick={onContinue}>
            Continue to Quiz
          </button>
        </div>
      </div>
    </motion.div>
  );
}
