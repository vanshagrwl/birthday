import { useCallback, useMemo, useState } from "react";

const PASS = "2005";

export function PhasePasscode({ onUnlocked }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState(null);

  const dots = useMemo(() => Array.from({ length: 4 }, (_, i) => i < digits.length), [digits]);

  const append = useCallback(
    (d) => {
      setHint(null);
      if (digits.length >= 4) return;
      const next = `${digits}${d}`;
      setDigits(next);
      if (next.length === 4) {
        if (next === PASS) {
          setTimeout(() => onUnlocked(), 280);
        } else {
          setShake(true);
          setHint("Almost… try again, Panda.");
          setDigits("");
          window.setTimeout(() => setShake(false), 520);
        }
      }
    },
    [digits, onUnlocked]
  );

  const backspace = useCallback(() => {
    setHint(null);
    setDigits((d) => d.slice(0, -1));
  }, []);

  const submit = useCallback(() => {
    if (digits.length !== 4) {
      setHint("Enter all 4 digits first.");
      return;
    }
    if (digits === PASS) {
      setTimeout(() => onUnlocked(), 280);
      return;
    }
    setShake(true);
    setHint("Almost… try again, Panda.");
    setDigits("");
    window.setTimeout(() => setShake(false), 520);
  }, [digits, onUnlocked]);

  const keys = useMemo(
    () => [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["back", "0", "enter"],
    ],
    []
  );

  return (
    <div className="phase1-shell">
      <div className="glass-panel phase1-card">
        <p className="title" style={{ margin: 0, fontSize: "clamp(22px, 5vw, 30px)", textAlign: "center", color: "#fff" }}>
          For Vanshika
        </p>
        <p className="subtle" style={{ margin: "10px 0 0", textAlign: "center", color: "rgba(255,255,255,0.88)", fontWeight: 650 }}>
          Enter the 4-digit passcode
        </p>

        <div
          className="passcode-row"
          style={{
            transform: shake ? "translateX(0)" : undefined,
            animation: shake ? "shakeX 0.42s ease" : undefined,
          }}
        >
          {dots.map((filled, i) => (
            <span key={i} className={`passcode-dot ${filled ? "passcode-dot--filled" : ""}`} />
          ))}
        </div>

        <div className="keypad" role="group" aria-label="Numeric keypad">
          {keys.flatMap((row, ri) =>
            row.map((k, ki) => {
              if (k === "back") {
                return (
                  <button
                    key="back"
                    type="button"
                    className="key-btn"
                    onClick={backspace}
                    aria-label="Delete"
                    style={{ fontSize: "clamp(14px, 3.8vw, 18px)" }}
                  >
                    ⌫
                  </button>
                );
              }
              if (k === "enter") {
                return (
                  <button
                    key="enter"
                    type="button"
                    className="key-btn"
                    onClick={submit}
                    aria-label="Submit passcode"
                    style={{ fontSize: "clamp(16px, 4vw, 20px)" }}
                  >
                    ✓
                  </button>
                );
              }
              return (
                <button key={k} type="button" className="key-btn" onClick={() => append(k)}>
                  {k}
                </button>
              );
            })
          )}
        </div>

        {hint ? <div className="toast">{hint}</div> : null}
      </div>
      <style>{`
        @keyframes shakeX {
          0% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
