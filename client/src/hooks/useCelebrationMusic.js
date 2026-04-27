import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Continuous Web Audio API Happy Birthday engine.
 * No external MP3, no <audio> tag.
 */
export function useCelebrationMusic() {
  const ctxRef = useRef(null);
  const loopTimerRef = useRef(null);
  const startedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const beat = 0.34; // seconds
  const melody = useMemo(
    () => [
      { f: 392.0, b: 1 }, // G4
      { f: 392.0, b: 1 },
      { f: 440.0, b: 2 }, // A4
      { f: 392.0, b: 2 },
      { f: 523.25, b: 2 }, // C5
      { f: 493.88, b: 4 }, // B4
      { f: 0, b: 0.6 }, // gap
      { f: 392.0, b: 1 },
      { f: 392.0, b: 1 },
      { f: 440.0, b: 2 },
      { f: 392.0, b: 2 },
      { f: 587.33, b: 2 }, // D5
      { f: 523.25, b: 4 },
      { f: 0, b: 0.6 },
      { f: 392.0, b: 1 },
      { f: 392.0, b: 1 },
      { f: 783.99, b: 2 }, // G5
      { f: 659.25, b: 2 }, // E5
      { f: 523.25, b: 2 },
      { f: 493.88, b: 2 },
      { f: 440.0, b: 4 },
      { f: 0, b: 0.6 },
      { f: 698.46, b: 1 }, // F5
      { f: 698.46, b: 1 },
      { f: 659.25, b: 2 },
      { f: 523.25, b: 2 },
      { f: 587.33, b: 2 },
      { f: 523.25, b: 4 },
      { f: 0, b: 1.2 }, // loop tail
    ],
    []
  );

  const totalDuration = useMemo(() => melody.reduce((sum, n) => sum + n.b * beat, 0), [melody]);

  const stop = useCallback(() => {
    if (loopTimerRef.current) {
      window.clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    startedRef.current = false;
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "closed") {
      try {
        ctx.close();
      } catch {
        /* ignore */
      }
    }
    ctxRef.current = null;
    setPlaying(false);
  }, []);

  const scheduleSequence = useCallback(
    (ctx, startAt) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.36, startAt); // loud and clear
      master.connect(ctx.destination);

      let cursor = startAt;
      for (const note of melody) {
        const length = note.b * beat;
        if (note.f > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(note.f, cursor);
          osc.connect(gain);
          gain.connect(master);

          gain.gain.setValueAtTime(0.0001, cursor);
          gain.gain.exponentialRampToValueAtTime(0.95, cursor + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, cursor + Math.max(0.08, length * 0.95));

          osc.start(cursor);
          osc.stop(cursor + length + 0.04);
        }
        cursor += length;
      }
    },
    [beat, melody]
  );

  const start = useCallback(async () => {
    try {
      if (startedRef.current && ctxRef.current) {
        if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
        setPlaying(true);
        return true;
      }

      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;

      const ctx = new Ctx();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const loop = () => {
        if (!ctxRef.current || ctx.state === "closed") return;
        const startAt = ctx.currentTime + 0.04;
        scheduleSequence(ctx, startAt);
        loopTimerRef.current = window.setTimeout(loop, totalDuration * 1000);
      };

      startedRef.current = true;
      loop();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [scheduleSequence, totalDuration]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, playing };
}
