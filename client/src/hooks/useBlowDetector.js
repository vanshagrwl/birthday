import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Real-time blow detection via Web Audio AnalyserNode (loud sustained input).
 * Also starts MediaRecorder on the same stream so the mic pipeline uses the MediaRecorder API
 * as requested (chunks discarded; detection remains sample-accurate via analyser).
 */
export function useBlowDetector({
  enabled,
  threshold = 0.28,
  sustainMs = 280,
  cooldownMs = 900,
  mobileTuned = false,
} = {}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [blown, setBlown] = useState(false);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(0);
  const loudSinceRef = useRef(null);
  const lastTriggerRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const ambientRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    loudSinceRef.current = null;
    ambientRef.current = 0;
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      mediaRecorderRef.current = null;
    }
    if (ctxRef.current) {
      try {
        ctxRef.current.close();
      } catch {
        /* ignore */
      }
      ctxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
    setLevel(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return undefined;
    }
    if (blown) {
      return undefined;
    }

    let cancelled = false;

    async function start() {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        if (typeof MediaRecorder !== "undefined") {
          try {
            const mime =
              MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
            const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
            rec.addEventListener("dataavailable", () => {});
            rec.start(250);
            mediaRecorderRef.current = rec;
          } catch {
            mediaRecorderRef.current = null;
          }
        }

        const ctx = new AudioContext();
        ctxRef.current = ctx;
        await ctx.resume();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        const freq = new Uint8Array(analyser.frequencyBinCount);
        const time = new Uint8Array(analyser.fftSize);
        setReady(true);

        const tick = () => {
          if (cancelled || !ctxRef.current) return;
          analyser.getByteFrequencyData(freq);
          let fsum = 0;
          for (let i = 0; i < freq.length; i += 1) fsum += freq[i];
          const normFreq = fsum / (freq.length * 255);

          analyser.getByteTimeDomainData(time);
          let dev = 0;
          for (let i = 0; i < time.length; i += 1) {
            const v = (time[i] - 128) / 128;
            dev += v * v;
          }
          const normTime = Math.sqrt(dev / time.length);

          const norm = Math.max(normFreq, normTime);
          if (ambientRef.current === 0) {
            ambientRef.current = norm;
          } else {
            ambientRef.current = ambientRef.current * 0.92 + norm * 0.08;
          }
          const adjusted = Math.max(0, norm - ambientRef.current * 0.55);
          const effectiveThreshold = mobileTuned ? threshold * 0.78 : threshold;
          const display = Math.min(1, adjusted / Math.max(effectiveThreshold * 0.95, 0.045));
          setLevel(display);

          const now = performance.now();
          if (adjusted > effectiveThreshold) {
            if (loudSinceRef.current == null) loudSinceRef.current = now;
            if (now - loudSinceRef.current >= sustainMs && now - lastTriggerRef.current > cooldownMs) {
              lastTriggerRef.current = now;
              setBlown(true);
              setLevel(1);
              return;
            }
          } else {
            loudSinceRef.current = null;
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Microphone access denied");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, blown, stop, threshold, sustainMs, cooldownMs, mobileTuned]);

  return { ready, error, blown, stop, level };
}
