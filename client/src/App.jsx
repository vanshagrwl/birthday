import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartsBackground } from "./components/HeartsBackground.jsx";
import { PhasePasscode } from "./components/PhasePasscode.jsx";
import { PhaseQuestion } from "./components/PhaseQuestion.jsx";
import { PhaseCake } from "./components/PhaseCake.jsx";
import { PhaseCelebration } from "./components/PhaseCelebration.jsx";
import { PhaseWishCard } from "./components/PhaseWishCard.jsx";
import { PhaseQuiz } from "./components/PhaseQuiz.jsx";
import { PhaseLetter } from "./components/PhaseLetter.jsx";
import { PhaseFinal } from "./components/PhaseFinal.jsx";
import { useCelebrationMusic } from "./hooks/useCelebrationMusic.js";

export default function App() {
  const [phase, setPhase] = useState(1);
  const [madam, setMadam] = useState(false);
  const [musicStatus, setMusicStatus] = useState("idle");
  const { start: startCelebrationMusic, playing: celebrationMusicPlaying } = useCelebrationMusic();
  const triggerCelebrationMusic = useCallback(async () => {
    const ok = await startCelebrationMusic();
    setMusicStatus(ok ? "playing" : "blocked");
  }, [startCelebrationMusic]);

  useEffect(() => {
    if (phase < 4) return;
    void triggerCelebrationMusic();

    // If autoplay is blocked, retry silently on interaction.
    const retry = () => {
      if (!celebrationMusicPlaying) void triggerCelebrationMusic();
    };
    window.addEventListener("pointerdown", retry);
    window.addEventListener("keydown", retry);
    window.addEventListener("touchstart", retry);
    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchstart", retry);
    };
  }, [phase, celebrationMusicPlaying, triggerCelebrationMusic]);

  const go = useCallback((n) => setPhase(n), []);
  const getPhaseNode = () => {
    if (phase === 1) return <PhasePasscode onUnlocked={() => go(2)} />;
    if (phase === 2) {
      return (
        <PhaseQuestion
          onYes={() => {
            setMadam(true);
            window.setTimeout(() => {
              go(3);
              setMadam(false);
            }, 2300);
          }}
        />
      );
    }
    if (phase === 3) return <PhaseCake onDone={() => go(4)} />;
    if (phase === 4) return <PhaseWishCard onContinue={() => go(5)} onMountStartMusic={triggerCelebrationMusic} />;
    if (phase === 5) return <PhaseCelebration onContinue={() => go(6)} musicPlaying={celebrationMusicPlaying} musicStatus={musicStatus} />;
    if (phase === 6) return <PhaseQuiz onContinue={() => go(7)} />;
    if (phase === 7) return <PhaseLetter onContinue={() => go(8)} />;
    return <PhaseFinal />;
  };

  return (
    <div className="app-root">
      <HeartsBackground />

      <AnimatePresence>
        {madam ? (
          <motion.div
            key="madam-toast"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "grid",
              placeItems: "center",
              padding: 18,
              background: "rgba(10, 0, 10, 0.35)",
              backdropFilter: "blur(8px)",
            }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="glass-panel luxe-madam-dialog"
              initial={{ y: 24, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <div className="title luxe-heading luxe-madam-dialog__title">Have a look at it madam ji!</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="luxe-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.section
            key={phase}
            className="luxe-phase"
            initial={{ opacity: 0, y: 24, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, scale: 0.99, filter: "blur(7px)" }}
            transition={{ type: "spring", stiffness: 125, damping: 22, mass: 0.65 }}
          >
            <div className="luxe-phase-node">{getPhaseNode()}</div>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
