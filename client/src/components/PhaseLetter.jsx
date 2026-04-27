import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PhaseLetter({ onContinue }) {
  const [opened, setOpened] = useState(false);
  const [letterSliding, setLetterSliding] = useState(false);
  const hearts = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  
  // Phase 1: Flap opens duration (600ms)
  const FLAP_ANIMATION_DURATION = 0.6;
  // Phase 2 starts after flap animation completes
  const LETTER_ANIMATION_DELAY = FLAP_ANIMATION_DURATION;
  const LETTER_ANIMATION_DURATION = 0.7;

  useEffect(() => {
    if (!opened) {
      setLetterSliding(false);
      return;
    }
    // Trigger letter animation after flap opens
    const id = window.setTimeout(
      () => setLetterSliding(true),
      FLAP_ANIMATION_DURATION * 1000
    );
    return () => window.clearTimeout(id);
  }, [opened]);

  return (
    <div className="luxe-letter-phase">
      <motion.div
        className="luxe-envelope-unit"
        initial={{ opacity: 0, y: 34, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <motion.button
          type="button"
          className="luxe-envelope-container"
          aria-label="Tap to open letter"
          onClick={() => {
            if (!opened) setOpened(true);
          }}
          animate={opened ? { y: 0 } : { y: [0, -8, 0] }}
          transition={opened ? { duration: 0.2 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* LAYER 1: Envelope Back */}
          <div className="envelope-back" aria-hidden="true" />

          {/* LAYER 2: Letter / Card (slides up when letterSliding is true) */}
          <motion.div
            className="envelope-letter"
            animate={letterSliding ? { translateY: "-42%" } : { translateY: 0 }}
            transition={{
              duration: LETTER_ANIMATION_DURATION,
              ease: "easeOut"
            }}
          >
            <div className="envelope-letter__content">
              <p className={`envelope-letter__message ${letterSliding ? 'letter-visible' : ''}`}>
                Thank you for being my friend since last 9 years and thank you for being my best friend since last 3 years
              </p>
            </div>
          </motion.div>

          {/* LAYER 3: Envelope Front Pocket */}
          <div className="envelope-front" aria-hidden="true" />

          {/* Decorative Ribbon & Bow */}
          <div className="envelope-ribbon" aria-hidden="true">
            <div className="envelope-ribbon__bow">🎀</div>
          </div>

          {/* LAYER 4: V-Shaped Flap (opens first) */}
          <motion.div
            className="envelope-flap"
            animate={opened ? { rotateX: 180 } : { rotateX: 0 }}
            transition={{
              duration: FLAP_ANIMATION_DURATION,
              ease: "easeInOut"
            }}
            style={{
              transformOrigin: "top center",
              transformStyle: "preserve-3d"
            }}
          >
            {/* 3D Wax Seal / Heart Element */}
            <motion.div
              className="envelope-seal"
              animate={opened ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{
                duration: 0.2,
                ease: "easeOut"
              }}
            >
              💖
            </motion.div>
          </motion.div>

          {/* Sparkle / Confetti Burst on Open */}
          <AnimatePresence>
            {opened && (
              <motion.div
                className="envelope-sparkles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="envelope-sparkle"
                    style={{
                      '--angle': `${i * 30}deg`,
                      '--delay': `${i * 0.1}s`
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    ✨
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tap Hint */}
          <motion.div
            className="envelope-tap-hint"
            initial={false}
            animate={opened ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="envelope-tap-hint__heart">💗</span>
            <span>Tap to open</span>
          </motion.div>

          {/* Floating Hearts */}
          <AnimatePresence>
            {opened ? (
              <motion.div className="envelope-hearts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {hearts.map((h) => (
                  <span key={h} className="envelope-hearts__item" style={{ "--hi": String(h) }}>
                    💖
                  </span>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.button>

        {/* Surrounding Decorations */}
        <div className="envelope-decorations" aria-hidden="true">
          {/* Floating Orbs */}
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="envelope-orb"
              style={{
                '--orb-x': `${20 + (i * 12)}%`,
                '--orb-delay': `${i * 2}s`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4 + (i * 0.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
          
          {/* Tiny Floating Hearts */}
          {[
            { x: -60, y: -40 }, { x: 60, y: -40 }, { x: -80, y: 20 }, { x: 80, y: 20 },
            { x: -40, y: 60 }, { x: 40, y: 60 }, { x: 0, y: -80 }, { x: 0, y: 80 }
          ].map((pos, i) => (
            <motion.span
              key={`mini-heart-${i}`}
              className="envelope-mini-heart"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                '--heart-delay': `${i * 0.8}s`
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3 + (i * 0.3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            >
              💕
            </motion.span>
          ))}
        </div>

        {/* Continue Button */}
        <AnimatePresence>
          {opened && letterSliding ? (
            <motion.button
              type="button"
              className="btn btn-primary luxe-primary-btn luxe-envelope-continue"
              onClick={onContinue}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ delay: 0.3 }}
            >
              Continue
            </motion.button>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
