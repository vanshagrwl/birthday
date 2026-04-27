import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { quizQuestions } from "../data/quiz.js";

export function PhaseQuiz({ onContinue }) {
  const [picked, setPicked] = useState({});
  const [idx, setIdx] = useState(0);
  const unlocked = idx === quizQuestions.length - 1;
  const hasPickedCurrent = Boolean(picked[quizQuestions[idx].id]);
  const allAnswered = quizQuestions.every((question) => Boolean(picked[question.id]));
  const q = quizQuestions[idx];
  const progress = useMemo(() => `${idx + 1} / ${quizQuestions.length}`, [idx]);

  return (
    <div className="panel" style={{ width: "min(780px, 100%)" }}>
      <div className="glass-panel luxe-glass-card luxe-quiz-card-wrap">
        <div className="luxe-quiz-header">
          <div>
            <p className="title luxe-heading" style={{ margin: 0, color: "#fff", fontSize: "clamp(30px, 6vw, 44px)" }}>
              Inside-joke quiz
            </p>
            <p className="subtle luxe-subtext" style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.88)", fontWeight: 650 }}>
              Panda vs Kutta / Khachchar edition
            </p>
          </div>
          <span className="luxe-progress-pill">{progress}</span>
        </div>

        <div className="luxe-quiz-carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              className="glass-panel luxe-quiz-card"
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 150, damping: 21 }}
            >
              <div className="luxe-quiz-q">{q.question}</div>
              <div className="luxe-quiz-options">
                {q.options.map((opt) => {
                  const isPicked = picked[q.id] === opt;
                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      className={`option luxe-option ${isPicked ? "option--picked" : ""}`}
                      onClick={() => setPicked((prev) => ({ ...prev, [q.id]: opt }))}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="luxe-quiz-footer">
          <button type="button" className="btn btn-ghost luxe-ghost-btn" disabled={idx === 0} onClick={() => setIdx((v) => Math.max(0, v - 1))}>
            Previous
          </button>
          {unlocked ? (
            <button type="button" className="btn btn-primary luxe-primary-btn" onClick={onContinue} disabled={!allAnswered}>
              Continue to final message
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary luxe-primary-btn"
              onClick={() => setIdx((v) => Math.min(quizQuestions.length - 1, v + 1))}
              disabled={!hasPickedCurrent}
            >
              Next question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
