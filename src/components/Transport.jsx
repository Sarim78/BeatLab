"use client";

import { useState } from "react";

/* ─────────────────────────────────────────
   Icons
───────────────────────────────────────── */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <polygon points="3,1 14,8 3,15" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="12" height="12" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 8a6 6 0 1 1 1.5 4L2 13.5V10H5.5l-1.2 1.2A4 4 0 1 0 4 8H2z" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   BPM Knob
───────────────────────────────────────── */
function BpmKnob({ bpm, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [startY,   setStartY]   = useState(0);
  const [startBpm, setStartBpm] = useState(bpm);

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartY(e.clientY);
    setStartBpm(bpm);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const delta = startY - e.clientY;         /* drag up = increase */
    const newBpm = Math.min(200, Math.max(60, startBpm + Math.round(delta * 0.5)));
    onChange(newBpm);
  };

  const handleMouseUp = () => setDragging(false);

  /* Map BPM (60–200) to rotation (-135 to +135 degrees) */
  const rotation = ((bpm - 60) / 140) * 270 - 135;

  return (
    <div
      style={{ userSelect: "none", cursor: dragging ? "ns-resize" : "ns-resize" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)",
        border: "2px solid #333",
        boxShadow: "0 0 0 1px #111, inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.6)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${rotation}deg)`,
        transition: dragging ? "none" : "transform 0.1s ease",
      }}>
        {/* Indicator dot */}
        <div style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#e8ff47",
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 0 6px #e8ff47",
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Transport Component
───────────────────────────────────────── */
export default function Transport({ isPlaying, engineReady, onPlay, onStop, onReset, bpm, onBpmChange }) {

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "16px 24px",
      background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
      borderRadius: 12,
      border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>

      {/* Logo */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: "#e8ff47",
        textShadow: "0 0 12px rgba(232,255,71,0.4)",
        marginRight: 8,
      }}>
        BEATLAB
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 40, background: "#2a2a2a" }} />

      {/* Play / Stop buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={isPlaying ? onStop : onPlay}
          disabled={!engineReady}
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            border: "1px solid",
            borderColor: isPlaying ? "#e8ff47" : "#333",
            background: isPlaying
              ? "rgba(232,255,71,0.12)"
              : "linear-gradient(180deg, #222 0%, #1a1a1a 100%)",
            color: isPlaying ? "#e8ff47" : "#888",
            cursor: engineReady ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            boxShadow: isPlaying ? "0 0 12px rgba(232,255,71,0.2)" : "none",
          }}
        >
          {isPlaying ? <StopIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={onReset}
          disabled={!engineReady}
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            border: "1px solid #333",
            background: "linear-gradient(180deg, #222 0%, #1a1a1a 100%)",
            color: "#555",
            cursor: engineReady ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#888"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
        >
          <ResetIcon />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 40, background: "#2a2a2a" }} />

      {/* BPM Control */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <BpmKnob bpm={bpm} onChange={onBpmChange} />

        <div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}>
            {bpm}
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.15em",
            marginTop: 2,
          }}>
            BPM
          </div>
        </div>

        {/* BPM +/- buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => onBpmChange(Math.min(200, bpm + 1))}
            style={{
              width: 24, height: 20, borderRadius: 4,
              border: "1px solid #2a2a2a", background: "#1a1a1a",
              color: "#555", cursor: "pointer", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#e8ff47"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
          >▲</button>
          <button
            onClick={() => onBpmChange(Math.max(60, bpm - 1))}
            style={{
              width: 24, height: 20, borderRadius: 4,
              border: "1px solid #2a2a2a", background: "#1a1a1a",
              color: "#555", cursor: "pointer", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#e8ff47"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#555"}
          >▼</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 40, background: "#2a2a2a" }} />

      {/* Engine status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: engineReady ? "#4ade80" : "#555",
          boxShadow: engineReady ? "0 0 8px rgba(74,222,128,0.6)" : "none",
          transition: "all 0.3s ease",
        }} />
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: "#444",
          letterSpacing: "0.1em",
        }}>
          {engineReady ? "ENGINE READY" : "LOADING..."}
        </span>
      </div>

    </div>
  );
}