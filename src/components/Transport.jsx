"use client";

import { useState } from "react";

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
    const delta  = startY - e.clientY;
    const newBpm = Math.min(200, Math.max(60, startBpm + Math.round(delta * 0.5)));
    onChange(newBpm);
  };

  const handleMouseUp = () => setDragging(false);
  const rotation = ((bpm - 60) / 140) * 270 - 135;

  return (
    <div
      style={{ userSelect: "none", cursor: "ns-resize" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)",
        border: "2px solid #333",
        boxShadow: "0 0 0 1px #111, inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.6)",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        transform: `rotate(${rotation}deg)`,
        transition: dragging ? "none" : "transform 0.1s ease",
      }}>
        <div style={{
          width: 4, height: 4, borderRadius: "50%", background: "#e8ff47",
          position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
          boxShadow: "0 0 6px #e8ff47",
        }} />
      </div>
    </div>
  );
}

export default function Transport({ isPlaying, engineReady, onPlay, onStop, onReset, bpm, onBpmChange, isMobile }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: isMobile ? 12 : 24,
      padding: isMobile ? "12px 14px" : "16px 24px",
      background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
      borderRadius: 12,
      border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>

      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: isMobile ? 14 : 18,
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: "#e8ff47",
        textShadow: "0 0 12px rgba(232,255,71,0.4)",
      }}>
        BEATLAB
      </div>

      {!isMobile && <div style={{ width: 1, height: 40, background: "#2a2a2a" }} />}

      {/* Play / Stop / Reset */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={isPlaying ? onStop : onPlay}
          disabled={!engineReady}
          style={{
            width: isMobile ? 40 : 44, height: isMobile ? 40 : 44,
            borderRadius: 8, border: "1px solid",
            borderColor: isPlaying ? "#e8ff47" : "#333",
            background: isPlaying ? "rgba(232,255,71,0.12)" : "linear-gradient(180deg, #222 0%, #1a1a1a 100%)",
            color: isPlaying ? "#e8ff47" : "#888",
            cursor: engineReady ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isPlaying ? "0 0 12px rgba(232,255,71,0.2)" : "none",
          }}
        >
          {isPlaying ? <StopIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={onReset}
          disabled={!engineReady}
          style={{
            width: isMobile ? 40 : 44, height: isMobile ? 40 : 44,
            borderRadius: 8, border: "1px solid #333",
            background: "linear-gradient(180deg, #222 0%, #1a1a1a 100%)",
            color: "#555", cursor: engineReady ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ResetIcon />
        </button>
      </div>

      {!isMobile && <div style={{ width: 1, height: 40, background: "#2a2a2a" }} />}

      {/* BPM */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BpmKnob bpm={bpm} onChange={onBpmChange} />
        <div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: isMobile ? 22 : 28,
            fontWeight: 700, color: "#fff", lineHeight: 1,
          }}>
            {bpm}
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10, color: "#444", letterSpacing: "0.15em", marginTop: 2,
          }}>
            BPM
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[["▲", 1], ["▼", -1]].map(([arrow, dir]) => (
            <button key={arrow}
              onClick={() => onBpmChange(Math.min(200, Math.max(60, bpm + dir)))}
              style={{
                width: 24, height: 20, borderRadius: 4,
                border: "1px solid #2a2a2a", background: "#1a1a1a",
                color: "#555", cursor: "pointer", fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{arrow}</button>
          ))}
        </div>
      </div>

      {/* Engine status — pushed to end */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: engineReady ? "#4ade80" : "#555",
          boxShadow: engineReady ? "0 0 8px rgba(74,222,128,0.6)" : "none",
        }} />
        {!isMobile && (
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10, color: "#444", letterSpacing: "0.1em",
          }}>
            {engineReady ? "ENGINE READY" : "LOADING..."}
          </span>
        )}
      </div>

    </div>
  );
}