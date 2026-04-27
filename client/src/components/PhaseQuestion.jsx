import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const NO_MESSAGES = [
  "Nice try...",
  "Nope",
  "Catch me if you can! 😜",
  "Aise kaise? 😂",
  "Ok, fine...",
  "Just click YES already! 🙄",
  "At last...",
];

const SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 32,
  mass: 0.42,
};

function randomScreenPos(btnElOrSize, yesEl) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = btnElOrSize?.offsetWidth ?? btnElOrSize?.w ?? 120;
  const h = btnElOrSize?.offsetHeight ?? btnElOrSize?.h ?? 44;
  const pad = 10;
  const minX = w / 2 + pad;
  const maxX = vw - w / 2 - pad;
  const minY = h / 2 + pad;
  const maxY = vh - h / 2 - pad;
  if (maxX <= minX || maxY <= minY) return { x: vw / 2, y: vh / 2 };

  let x = minX + Math.random() * (maxX - minX);
  let y = minY + Math.random() * (maxY - minY);

  if (yesEl) {
    const yr = yesEl.getBoundingClientRect();
    const ycx = yr.left + yr.width / 2;
    const ycy = yr.top + yr.height / 2;
    const minDist = 100;
    for (let i = 0; i < 36; i += 1) {
      if (Math.hypot(x - ycx, y - ycy) >= minDist) break;
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);
    }
  }
  return { x, y };
}

export function PhaseQuestion({ onYes }) {
  const yesRef = useRef(null);
  const noBtnRef = useRef(null);
  const [evasive, setEvasive] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [ripple, setRipple] = useState(false);
  const [toast, setToast] = useState(null);

  const locked = dodgeCount >= NO_MESSAGES.length;

  const noLabel = useMemo(() => {
    if (dodgeCount === 0) return "No";
    return NO_MESSAGES[Math.min(dodgeCount - 1, NO_MESSAGES.length - 1)];
  }, [dodgeCount]);

  const dodge = useCallback(() => {
    if (locked) return;
    const no = noBtnRef.current;
    const yes = yesRef.current;
    if (!no) return;
    setDodgeCount((c) => (c >= NO_MESSAGES.length ? c : c + 1));
    setNoPos(randomScreenPos(no, yes));
  }, [locked]);

  const onNoMouseEnter = useCallback(() => {
    if (locked) return;
    if (!evasive) {
      setEvasive(true);
      setDodgeCount(1);
      setNoPos(randomScreenPos({ w: 120, h: 44 }, yesRef.current));
      return;
    }
    dodge();
  }, [locked, evasive, dodge]);

  const onNoPointerDown = useCallback(
    (e) => {
      if (locked) return;
      e.preventDefault();
      if (!evasive) {
        setEvasive(true);
        setDodgeCount(1);
        setNoPos(randomScreenPos({ w: 120, h: 44 }, yesRef.current));
        return;
      }
      if (e.pointerType !== "mouse") dodge();
    },
    [locked, evasive, dodge]
  );

  useEffect(() => {
    const onResize = () => {
      if (locked || !evasive) return;
      const no = noBtnRef.current;
      const yes = yesRef.current;
      if (!no || !yes) return;
      setNoPos(randomScreenPos(no, yes));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [evasive, locked]);

  return (
    <motion.div className="luxe-phase2-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <div className="luxe-phase2-bg" aria-hidden />
      <div className="luxe-phase2-inner">
        <div className="glass-panel luxe-phase2-card">
          <div className="luxe-phase2-cake" aria-hidden>
            🎂
          </div>
          <h2 className="luxe-heading luxe-phase2-title">
            <span className="luxe-phase2-title__line">It&apos;s your special day...</span>
            <span className="luxe-phase2-title__line">Do you wanna see what I made??</span>
          </h2>

          <div className="luxe-phase2-btn-row">
            <button
              ref={yesRef}
              type="button"
              className="luxe-phase2-btn luxe-phase2-btn--yes"
              onClick={() => {
                setRipple(true);
                window.setTimeout(() => onYes(), 360);
              }}
            >
              {ripple ? (
                <motion.span
                  className="luxe-ripple"
                  initial={{ scale: 0, opacity: 0.65 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              ) : null}
              <span className="luxe-phase2-btn__text">Yes</span>
            </button>

            {!evasive ? (
              <button
                ref={noBtnRef}
                type="button"
                className="luxe-phase2-btn luxe-phase2-btn--no luxe-phase2-btn--no-inline"
                aria-live="polite"
                onClick={() => setToast("Nice try — the only way forward is Yes!")}
                onMouseEnter={onNoMouseEnter}
                onPointerDown={onNoPointerDown}
              >
                <span className="luxe-phase2-btn__text luxe-phase2-btn__text--no">{noLabel}</span>
              </button>
            ) : null}
          </div>
        </div>

        {evasive && typeof document !== "undefined"
          ? createPortal(
              <motion.button
                ref={noBtnRef}
                type="button"
                className="luxe-phase2-btn luxe-phase2-btn--no luxe-phase2-btn--no-float"
                aria-live="polite"
                aria-disabled={locked}
                tabIndex={locked ? -1 : 0}
                style={{
                  position: "fixed",
                  pointerEvents: locked ? "none" : "auto",
                  zIndex: 50,
                }}
                initial={false}
                animate={{ left: noPos.x, top: noPos.y, x: "-50%", y: "-50%" }}
                transition={SPRING}
                onClick={() => {
                  if (!locked) setToast("Nice try — the only way forward is Yes!");
                }}
                onMouseEnter={onNoMouseEnter}
                onPointerDown={onNoPointerDown}
              >
                <span className="luxe-phase2-btn__text luxe-phase2-btn__text--no">{noLabel}</span>
              </motion.button>,
              document.body
            )
          : null}

        {toast ? <div className="toast luxe-toast">{toast}</div> : null}
      </div>
    </motion.div>
  );
}
