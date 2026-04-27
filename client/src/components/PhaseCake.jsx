import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlowDetector } from "../hooks/useBlowDetector.js";

const CANDLE_X = [28, 40, 50, 60, 72];

const FIRM_HOLD_MS = 1450;
const MOVE_CANCEL_PX = 26;
const CUT_PATH_PX = 88;
const BLOW_THRESHOLD = 0.29;
const BLOW_SUSTAIN_MS = 300;

function bladeTipFromKnifeEl(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + 10, y: r.top + r.height * 0.42 };
}

export function PhaseCake({ onDone }) {
  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(pointer: coarse)").matches;
  }, []);
  const [blownScreen, setBlownScreen] = useState(false);
  const firmHoldMs = isCoarsePointer ? 950 : FIRM_HOLD_MS;
  const moveCancelPx = isCoarsePointer ? 34 : MOVE_CANCEL_PX;
  const cutPathPx = isCoarsePointer ? 58 : CUT_PATH_PX;
  const blowThreshold = isCoarsePointer ? 0.22 : BLOW_THRESHOLD;
  const blowSustainMs = isCoarsePointer ? 220 : BLOW_SUSTAIN_MS;
  /* Don’t reference blownMic in `enabled` — it’s returned by this hook (TDZ crash). */
  const { ready, error, blown: blownMic, level } = useBlowDetector({
    enabled: !blownScreen,
    threshold: blowThreshold,
    sustainMs: blowSustainMs,
    cooldownMs: 850,
  });
  const firmRef = useRef(null);
  const firmOrigin = useRef(null);
  const firmTimerRef = useRef(null);
  const pointerDownRef = useRef(false);
  const pressureHighSince = useRef(null);

  const candlesOut = blownMic || blownScreen;

  const [showKnife, setShowKnife] = useState(false);
  const [sliced, setSliced] = useState(false);
  const [fade, setFade] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [sliceSeparated, setSliceSeparated] = useState(false);
  const [showCrumbs, setShowCrumbs] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const cakeWrapRef = useRef(null);
  const cakeBodyRef = useRef(null);
  const knifeRef = useRef(null);
  const pathInCakeRef = useRef(0);
  const lastTipRef = useRef(null);
  const [knifePct, setKnifePct] = useState({ x: 86, y: 58 });
  const [knifeDragging, setKnifeDragging] = useState(false);
  const [knifeMoving, setKnifeMoving] = useState(false);
  const knifeDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const knifeVelocityRef = useRef({ x: 0, y: 0 });
  const lastKnifePosRef = useRef({ x: 86, y: 58 });
  const knifeMovingTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!candlesOut) return;
    setShowSmoke(true);
    const t = window.setTimeout(() => setShowKnife(true), 900);
    return () => window.clearTimeout(t);
  }, [candlesOut]);

  /* Firm press on screen (hold still) OR stylus pressure burst */
  const endFirmTracking = useCallback(() => {
    pointerDownRef.current = false;
    firmOrigin.current = null;
    pressureHighSince.current = null;
    if (firmTimerRef.current != null) {
      window.clearTimeout(firmTimerRef.current);
      firmTimerRef.current = null;
    }
  }, []);

  const onFirmPointerDown = useCallback(
    (e) => {
      if (candlesOut) return;
      pointerDownRef.current = true;
      firmOrigin.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (firmTimerRef.current != null) window.clearTimeout(firmTimerRef.current);
      firmTimerRef.current = window.setTimeout(() => {
        firmTimerRef.current = null;
        if (pointerDownRef.current) setBlownScreen(true);
      }, firmHoldMs);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [candlesOut]
  );

  const onFirmPointerMove = useCallback(
    (e) => {
      if (!firmOrigin.current || candlesOut) return;
      const d = Math.hypot(e.clientX - firmOrigin.current.x, e.clientY - firmOrigin.current.y);
      if (d > moveCancelPx) {
        if (firmTimerRef.current != null) {
          window.clearTimeout(firmTimerRef.current);
          firmTimerRef.current = null;
        }
        endFirmTracking();
        return;
      }
      if (e.pressure > 0.62) {
        const now = performance.now();
        if (pressureHighSince.current == null) pressureHighSince.current = now;
        if (now - pressureHighSince.current >= 260) {
          setBlownScreen(true);
          endFirmTracking();
        }
      } else {
        pressureHighSince.current = null;
      }
    },
    [candlesOut, endFirmTracking, moveCancelPx]
  );

  const onFirmPointerUp = useCallback(() => {
    endFirmTracking();
  }, [endFirmTracking]);

  const tryRegisterCut = useCallback(() => {
    if (!showKnife || sliced) return;
    if (pathInCakeRef.current >= cutPathPx) {
      setSliced(true);
      setFade(true);
      
      // Trigger slice separation animation
      setTimeout(() => setSliceSeparated(true), 200);
      
      // Trigger crumbs effect
      setTimeout(() => setShowCrumbs(true), 400);
      
      // Trigger confetti burst
      setTimeout(() => setShowConfetti(true), 600);
      
      // Proceed to next phase
      window.setTimeout(() => onDone(), 1700);
    }
  }, [showKnife, sliced, onDone, cutPathPx]);

  const updateKnifePath = useCallback(() => {
    const tip = bladeTipFromKnifeEl(knifeRef.current);
    const bodyEl = cakeBodyRef.current;
    if (!tip || !bodyEl) return;
    const br = bodyEl.getBoundingClientRect();
    const inside =
      tip.x >= br.left && tip.x <= br.right && tip.y >= br.top && tip.y <= br.bottom + 6;
    if (inside) {
      const prev = lastTipRef.current;
      if (prev) pathInCakeRef.current += Math.hypot(tip.x - prev.x, tip.y - prev.y);
      lastTipRef.current = tip;
    } else {
      lastTipRef.current = tip;
    }
  }, []);

  const onKnifePointerDown = useCallback(
    (e) => {
      if (!showKnife || sliced) return;
      e.preventDefault();
      e.stopPropagation();
      const wrap = cakeWrapRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      const px = ((e.clientX - wr.left) / wr.width) * 100;
      const py = ((e.clientY - wr.top) / wr.height) * 100;
      dragOffsetRef.current = { x: px - knifePct.x, y: py - knifePct.y };
      knifeDraggingRef.current = true;
      setKnifeDragging(true);
      pathInCakeRef.current = 0;
      lastTipRef.current = null;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [showKnife, sliced, knifePct]
  );

  const onKnifePointerMove = useCallback(
    (e) => {
      if (!knifeDraggingRef.current || sliced) return;
      const wrap = cakeWrapRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      let px = ((e.clientX - wr.left) / wr.width) * 100 - dragOffsetRef.current.x;
      let py = ((e.clientY - wr.top) / wr.height) * 100 - dragOffsetRef.current.y;
      px = Math.min(94, Math.max(6, px));
      py = Math.min(92, Math.max(8, py));
      
      // Set moving state for dynamic lighting
      setKnifeMoving(true);
      clearTimeout(knifeMovingTimeoutRef.current);
      knifeMovingTimeoutRef.current = setTimeout(() => setKnifeMoving(false), 150);
      
      // Calculate velocity for cutting resistance
      const currentTime = performance.now();
      const deltaTime = currentTime - (lastKnifePosRef.current.time || currentTime);
      knifeVelocityRef.current = {
        x: (px - lastKnifePosRef.current.x) / Math.max(deltaTime, 1),
        y: (py - lastKnifePosRef.current.y) / Math.max(deltaTime, 1)
      };
      lastKnifePosRef.current = { x: px, y: py, time: currentTime };
      
      // Apply cutting resistance when inside cake
      const tip = bladeTipFromKnifeEl(knifeRef.current);
      const bodyEl = cakeBodyRef.current;
      if (tip && bodyEl) {
        const br = bodyEl.getBoundingClientRect();
        const inside = tip.x >= br.left && tip.x <= br.right && tip.y >= br.top && tip.y <= br.bottom + 6;
        if (inside && knifeVelocityRef.current.x > 0.5) {
          // Add resistance by slightly slowing down horizontal movement
          px -= knifeVelocityRef.current.x * 0.3;
          // Add subtle screen shake
          if (cakeWrapRef.current) {
            cakeWrapRef.current.style.transform = `translate(${Math.sin(currentTime * 0.05) * 0.5}px, ${Math.cos(currentTime * 0.05) * 0.5}px)`;
            setTimeout(() => {
              if (cakeWrapRef.current) cakeWrapRef.current.style.transform = '';
            }, 50);
          }
        }
      }
      
      setKnifePct({ x: px, y: py });
      requestAnimationFrame(() => {
        updateKnifePath();
        tryRegisterCut();
      });
    },
    [sliced, updateKnifePath, tryRegisterCut]
  );

  const onKnifePointerUp = useCallback(
    (e) => {
      knifeDraggingRef.current = false;
      setKnifeDragging(false);
      setKnifeMoving(false);
      clearTimeout(knifeMovingTimeoutRef.current);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      tryRegisterCut();
    },
    [tryRegisterCut]
  );

  useEffect(() => {
    if (!knifeDragging) return undefined;
    const onWindowMove = (e) => onKnifePointerMove(e);
    const onWindowUp = (e) => onKnifePointerUp(e);
    window.addEventListener("pointermove", onWindowMove, { passive: false });
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowUp);
    return () => {
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    };
  }, [knifeDragging, onKnifePointerMove, onKnifePointerUp]);

  const candleClass = candlesOut ? "candle candle--out" : "candle";

  const title = useMemo(() => {
    if (!candlesOut) return "Blow the candles";
    if (!showKnife) return "The candles heard you";
    if (!sliced) return "Cut the cake";
    return "Slicing…";
  }, [candlesOut, showKnife, sliced]);

  const hint = useMemo(() => {
    if (!candlesOut) {
      if (error) {
        return "Mic unavailable — press & hold firmly on the pink ring below (or use a stylus with pressure).";
      }
      if (!ready) return "Allow the microphone, then blow sharply at the device — watch the meter.";
      return "Blow hard enough to fill the meter — or firm-press the ring / stylus pressure.";
    }
    if (!showKnife) return "Little wisps of smoke…";
    if (!sliced) return "Click & drag the knife across the cake (finger on mobile).";
    return "Serving the next chapter…";
  }, [candlesOut, error, ready, showKnife, sliced]);

  const meterPct = Math.min(100, Math.round((level ?? 0) * 100));

  return (
    <motion.div className="cake-stage cake-stage--scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-panel cake-scene-panel luxe-glass-card cake-scene-panel--root">
        <p className="title cake-scene-title luxe-heading">{title}</p>
        <p className="subtle cake-scene-hint luxe-subtext">{hint}</p>

        {!candlesOut ? (
          <div className="cake-blow-meter-wrap" aria-hidden={false}>
            <div className="cake-blow-meter__label">Blow strength</div>
            <div className="cake-blow-meter">
              <div className="cake-blow-meter__fill" style={{ width: `${meterPct}%` }} />
            </div>
            <p className="cake-blow-meter__hint">Hold a strong puff until the bar stays full long enough.</p>
          </div>
        ) : null}

        <div className={`cake-scene ${fade ? "cake-scene--fade" : ""}`}>
          <div
            ref={cakeWrapRef}
            className={`cake-wrap ${sliced ? "cake-wrap--slice" : ""} ${knifeMoving ? "cake-wrap--moving" : ""}`}
            style={{ touchAction: knifeDragging ? "none" : "manipulation" }}
          >
            <div className="cake-frost-top" />
            {CANDLE_X.map((x, i) => (
              <div key={i} className={candleClass} style={{ left: `${x}%`, transform: "translateX(-50%)" }}>
                {!candlesOut ? <div className="candle-flame" /> : null}
              </div>
            ))}
            <div ref={cakeBodyRef} className="cake-body" />

            {/* Slice Separation Animation */}
            <AnimatePresence>
              {sliceSeparated ? (
                <motion.div 
                  className="cake-slice"
                  initial={{ x: 0, rotateZ: 0 }}
                  animate={{ x: 40, rotateZ: -8 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="cake-slice__layers">
                    <div className="cake-slice__layer cake-slice__layer--frosting"></div>
                    <div className="cake-slice__layer cake-slice__layer--cake"></div>
                    <div className="cake-slice__layer cake-slice__layer--filling"></div>
                    <div className="cake-slice__layer cake-slice__layer--cake"></div>
                    <div className="cake-slice__layer cake-slice__layer--base"></div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Falling Crumbs */}
            <AnimatePresence>
              {showCrumbs ? (
                <div className="cake-crumbs">
                  {Array.from({ length: 15 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="cake-crumb"
                      style={{
                        left: `${45 + (i % 5) * 6}%`,
                        '--fall-delay': `${i * 0.1}s`,
                        '--fall-duration': `${1.5 + (i % 3) * 0.5}s`
                      }}
                      initial={{ y: 0, opacity: 1, rotateZ: 0 }}
                      animate={{ 
                        y: 80 + (i % 4) * 20, 
                        opacity: 0,
                        rotateZ: (i % 2 === 0 ? 360 : -360)
                      }}
                      transition={{ 
                        duration: 1.5 + (i % 3) * 0.5,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </AnimatePresence>

            {/* Celebration Confetti */}
            <AnimatePresence>
              {showConfetti ? (
                <div className="cake-confetti">
                  {Array.from({ length: 20 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="cake-confetti-piece"
                      style={{
                        '--confetti-color': `hsl(${i * 18}, 80%, 60%)`,
                        '--confetti-x': `${20 + (i % 4) * 15}%`,
                        '--confetti-delay': `${i * 0.05}s`
                      }}
                      initial={{ 
                        y: 50, 
                        x: 0,
                        opacity: 1,
                        rotateZ: 0,
                        scale: 1
                      }}
                      animate={{ 
                        y: -100 - (i % 3) * 30,
                        x: (i % 2 === 0 ? 50 : -50) + (i % 4) * 20,
                        opacity: 0,
                        rotateZ: (i % 2 === 0 ? 720 : -720),
                        scale: 0.5
                      }}
                      transition={{ 
                        duration: 2 + (i % 2) * 0.5,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {showSmoke ? (
                <motion.div className="cake-smoke" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="cake-smoke__wisp cake-smoke__wisp--1" />
                  <span className="cake-smoke__wisp cake-smoke__wisp--2" />
                  <span className="cake-smoke__wisp cake-smoke__wisp--3" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              ref={knifeRef}
              type="button"
              className={`cake-knife-btn ${showKnife ? "cake-knife-btn--show" : ""} ${knifeDragging ? "cake-knife-btn--drag" : ""} ${knifeMoving ? "cake-knife-btn--moving" : ""}`}
              style={{
                left: `${knifePct.x}%`,
                top: `${knifePct.y}%`,
                right: "auto",
                bottom: "auto",
                transform: "translate(-50%, -50%) rotate(-24deg)",
              }}
              aria-label="Drag to cut the cake"
              disabled={!showKnife || sliced}
              onPointerDown={onKnifePointerDown}
              onPointerMove={onKnifePointerMove}
              onPointerUp={onKnifePointerUp}
              onPointerCancel={onKnifePointerUp}
              initial={false}
              animate={showKnife ? { opacity: sliced ? 0.4 : 1 } : { opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <span className="cake-knife-btn__blade" aria-hidden="true" />
              <span className="cake-knife-btn__handle" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {!candlesOut ? (
          <div className="cake-blow-actions">
            <div
              ref={firmRef}
              role="button"
              tabIndex={0}
              className="cake-firm-ring"
              onPointerDown={onFirmPointerDown}
              onPointerMove={onFirmPointerMove}
              onPointerUp={onFirmPointerUp}
              onPointerCancel={onFirmPointerUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.preventDefault();
              }}
            >
              <span className="cake-firm-ring__pulse" />
              <span className="cake-firm-ring__label">Firm press &amp; hold</span>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
