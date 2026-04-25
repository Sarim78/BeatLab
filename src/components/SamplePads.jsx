"use client";

import { useRef, useEffect } from "react";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const BAR_COUNT  = 32;
const ACCENT     = "#e8ff47";
const ACCENT_RGB = "232,255,71";

/* ─────────────────────────────────────────
   Visualizer Component
   Canvas-based animated bar visualizer
   reacts to beat steps and VU levels
───────────────────────────────────────── */
export default function Visualizer({ isPlaying, currentStep, levels }) {
  const canvasRef  = useRef(null);
  const barsRef    = useRef(Array(BAR_COUNT).fill(0));
  const rafRef     = useRef(null);
  const frameRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const draw = () => {
      frameRef.current++;

      /* ── Clear ── */
      ctx.fillStyle = "#0e0e0e";
      ctx.fillRect(0, 0, W, H);

      /* ── Grid lines ── */
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let y = H * 0.25; y < H; y += H * 0.25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      /* ── Animate bars ── */
      const peakLevel = levels
        ? Math.max(...levels.map((l) => l ?? 0))
        : 0;

      /* Inject energy on beat */
      if (isPlaying && frameRef.current % 2 === 0) {
        for (let i = 0; i < BAR_COUNT; i++) {
          /* Base noise floor */
          const noise = isPlaying ? Math.random() * 0.08 : 0;
          /* Beat pulse centered on bar groups matching current step */
          const stepFraction = (currentStep ?? 0) / 16;
          const barFraction  = i / BAR_COUNT;
          const proximity    = 1 - Math.abs(barFraction - stepFraction);
          const pulse        = isPlaying ? proximity * peakLevel * 0.6 : 0;
          barsRef.current[i] = Math.min(1, barsRef.current[i] + noise + pulse);
        }
      }

      /* Decay bars */
      barsRef.current = barsRef.current.map((v) => Math.max(0, v * 0.88));

      /* ── Draw bars ── */
      const barW   = (W - BAR_COUNT + 1) / BAR_COUNT;
      const margin = 1;

      for (let i = 0; i < BAR_COUNT; i++) {
        const barH  = barsRef.current[i] * (H - 16);
        const x     = i * (barW + margin);
        const y     = H - barH;
        const alpha = 0.4 + barsRef.current[i] * 0.6;

        /* Gradient per bar */
        const grad = ctx.createLinearGradient(0, y, 0, H);
        grad.addColorStop(0, `rgba(${ACCENT_RGB}, ${alpha})`);
        grad.addColorStop(0.6, `rgba(${ACCENT_RGB}, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${ACCENT_RGB}, 0.05)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();

        /* Peak cap */
        if (barH > 4) {
          ctx.fillStyle = ACCENT;
          ctx.globalAlpha = alpha;
          ctx.fillRect(x, y, barW, 2);
          ctx.globalAlpha = 1;
        }
      }

      /* ── Center line ── */
      ctx.strokeStyle = `rgba(${ACCENT_RGB}, 0.06)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      /* ── Step indicator dots ── */
      if (currentStep !== undefined) {
        const dotSpacing = W / 16;
        for (let s = 0; s < 16; s++) {
          const dotX  = s * dotSpacing + dotSpacing / 2;
          const isCur = s === currentStep && isPlaying;
          ctx.beginPath();
          ctx.arc(dotX, H - 8, isCur ? 3 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = isCur
            ? ACCENT
            : "rgba(255,255,255,0.15)";
          ctx.fill();
          if (isCur) {
            ctx.beginPath();
            ctx.arc(dotX, H - 8, 6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${ACCENT_RGB}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      /* ── BEATLAB watermark ── */
      ctx.font = "700 10px 'Courier New'";
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.textAlign = "right";
      ctx.fillText("BEATLAB", W - 10, 18);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    /* Resize handler */
    const onResize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [isPlaying, currentStep, levels]);

  return (
    <div style={{
      padding: "0",
      background: "#0e0e0e",
      borderRadius: 12,
      border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Header overlay */}
      <div style={{
        position: "absolute",
        top: 12,
        left: 16,
        fontFamily: "'Courier New', monospace",
        fontSize: 10,
        color: "#333",
        letterSpacing: "0.2em",
        zIndex: 1,
        pointerEvents: "none",
      }}>
        VISUALIZER
      </div>

      {/* Status indicator */}
      <div style={{
        position: "absolute",
        top: 14,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        zIndex: 1,
        pointerEvents: "none",
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isPlaying ? ACCENT : "#333",
          boxShadow: isPlaying ? `0 0 8px rgba(${ACCENT_RGB}, 0.8)` : "none",
          transition: "all 0.2s ease",
        }} />
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          color: "#333",
          letterSpacing: "0.1em",
        }}>
          {isPlaying ? "LIVE" : "IDLE"}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 140,
          display: "block",
        }}
      />
    </div>
  );
}