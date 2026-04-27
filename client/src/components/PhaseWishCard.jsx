import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import photoTopLeft from "../assets/10097.png";
import photoBottomRight from "../assets/10098.png";

const WISH_TEXT = "I wish you happiness and may all your dreams come true";
const WISH_WORDS = ["I", "wish", "you", "happiness", "and", "may", "all", "your", "dreams", "come", "true"];

function playSoftChime() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    master.connect(ctx.destination);

    const notes = [783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.5);
    });

    window.setTimeout(() => {
      void ctx.close();
    }, 1700);
  } catch {
    /* ignore */
  }
}

export function PhaseWishCard({ onContinue, onMountStartMusic }) {
  const [revealed, setRevealed] = useState(false);
  const words = useMemo(() => WISH_WORDS, []);
  const confetti = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 13 + 7) % 100}%`,
        delay: `${(i % 8) * 0.45}s`,
        dur: `${6 + (i % 5) * 1.1}s`,
      })),
    []
  );

  useEffect(() => {
    setRevealed(true);
    playSoftChime();
    if (onMountStartMusic) {
      void onMountStartMusic();
    }
    const continueTimer = window.setTimeout(() => {
      onContinue();
    }, 8600);
    return () => {
      window.clearTimeout(continueTimer);
    };
  }, [onContinue, onMountStartMusic]);

  return (
    <motion.div className="luxe-wish-phase luxe-stage-wish" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="luxe-stage-wish-shell" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="luxe-stage-confetti" aria-hidden="true">
          {confetti.map((item) => (
            <span key={item.id} className="luxe-stage-confetti__piece" style={{ left: item.left, animationDelay: item.delay, animationDuration: item.dur }} />
          ))}
        </div>

        <motion.div
          className="luxe-stage-scroll"
          initial={{ scaleY: 0.22, opacity: 0.2 }}
          animate={revealed ? { scaleY: 1, opacity: 1 } : { scaleY: 0.22, opacity: 0.2 }}
          transition={{ delay: 3.05, duration: 1.05, ease: "easeOut" }}
        >
          <div className="luxe-stage-scroll__panda" aria-hidden="true">
            <svg viewBox="0 0 180 120" className="luxe-stage-scroll__panda-svg">
              <circle cx="58" cy="46" r="15" fill="#251726" />
              <circle cx="122" cy="46" r="15" fill="#251726" />
              <ellipse cx="90" cy="67" rx="46" ry="34" fill="#fff8ff" />
              <ellipse cx="72" cy="68" rx="11" ry="9" fill="#2a1728" />
              <ellipse cx="108" cy="68" rx="11" ry="9" fill="#2a1728" />
              <circle cx="72" cy="68" r="3.7" fill="#fff" />
              <circle cx="108" cy="68" r="3.7" fill="#fff" />
              <ellipse cx="90" cy="81" rx="8" ry="6" fill="#241423" />
            </svg>
          </div>

          <div className="luxe-stage-scroll__cap luxe-stage-scroll__cap--top" aria-hidden="true" />
          <div className="luxe-stage-scroll__body">
            <motion.h2 className="luxe-wish-title" initial={{ opacity: 0, y: 8 }} animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 }} transition={{ delay: 3.4, duration: 0.5 }}>
              Happy Birthday!
            </motion.h2>
            <motion.p className="luxe-wish-text" aria-live="polite" aria-label={WISH_TEXT} initial={{ opacity: 0 }} animate={{ opacity: revealed ? 1 : 0 }} transition={{ delay: 3.75, duration: 0.55 }}>
              {words.join(" ")}.
            </motion.p>
          </div>
          <div className="luxe-stage-scroll__cap luxe-stage-scroll__cap--bottom" aria-hidden="true" />
        </motion.div>

        <motion.div
          className="luxe-hanging-photo luxe-hanging-photo--top-left"
          initial={{ y: -240, opacity: 0 }}
          animate={revealed ? { y: 0, opacity: 1 } : { y: -240, opacity: 0 }}
          transition={{ delay: 4.15, duration: 0.72, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className="luxe-hanging-photo__thread" />
          <div className="luxe-hanging-photo__frame">
            <img src={photoTopLeft} alt="" className="luxe-hanging-photo__img" />
          </div>
        </motion.div>

        <motion.div
          className="luxe-hanging-photo luxe-hanging-photo--bottom-right"
          initial={{ y: -260, opacity: 0 }}
          animate={revealed ? { y: 0, opacity: 1 } : { y: -260, opacity: 0 }}
          transition={{ delay: 4.45, duration: 0.74, ease: "easeOut" }}
          aria-hidden="true"
        >
          <span className="luxe-hanging-photo__thread" />
          <div className="luxe-hanging-photo__frame">
            <img src={photoBottomRight} alt="" className="luxe-hanging-photo__img" />
          </div>
        </motion.div>

        <motion.div className="luxe-curtain luxe-curtain--left" initial={{ x: "0%" }} animate={{ x: revealed ? "-102%" : "0%" }} transition={{ duration: 3, ease: "easeInOut" }} />
        <motion.div className="luxe-curtain luxe-curtain--right" initial={{ x: "0%" }} animate={{ x: revealed ? "102%" : "0%" }} transition={{ duration: 3, ease: "easeInOut" }} />
      </motion.div>
    </motion.div>
  );
}
