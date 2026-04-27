import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PhaseFinal() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState(null);

  const canSubmit = useMemo(() => text.trim().length > 0 && status !== "sending" && status !== "done", [text, status]);

  const submit = async () => {
    if (!canSubmit) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not send right now.");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Something went wrong.");
    }
  };

  return (
    <div className="panel">
      <div className="glass-panel luxe-glass-card luxe-letter-card">
        <AnimatePresence mode="wait">
          {status !== "done" ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}>
              <p className="title luxe-heading" style={{ margin: 0, color: "#fff", fontSize: "clamp(28px, 5vw, 42px)", textAlign: "center" }}>
                One last thing
              </p>
              <p className="subtle luxe-subtext" style={{ margin: "10px 0 14px", color: "rgba(255,255,255,0.88)", fontWeight: 650, textAlign: "center" }}>
                If anything made you smile (or cry in a good way), I’d love to read it.
              </p>

              <div className="field luxe-field">
                <label htmlFor="msg" className="luxe-hindi-label">
                  आपको कुछ कहना है?
                </label>
                <textarea
                  id="msg"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  maxLength={4000}
                  placeholder="Type here…"
                  autoComplete="off"
                  className="luxe-message-input"
                />
              </div>

              {error ? (
                <div className="toast" style={{ marginTop: 12, color: "#5b0f38" }}>
                  {error}
                </div>
              ) : null}

              <motion.div style={{ display: "flex", justifyContent: "center", marginTop: 14 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.button
                  type="button"
                  className="btn btn-primary luxe-primary-btn luxe-submit-pulse"
                  disabled={!canSubmit}
                  onClick={submit}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === "sending" ? "Sending…" : "Submit"}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="thanks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ textAlign: "center" }}>
                <p className="title luxe-heading luxe-thank-you" style={{ margin: 0 }}>
                  Thank You!
                </p>
                <p className="subtle luxe-subtext" style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.9)", fontWeight: 700, lineHeight: 1.55 }}>
                  Your message is on its way. You made this little corner of the internet feel extra special today.
                </p>
                <div className="luxe-final-hearts" aria-hidden="true">
                  <span>💖</span>
                  <span>💕</span>
                  <span>💞</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
