"use client";

import { useState, useEffect, useCallback } from "react";
import { synthTrigger, INSTRUMENTS } from "../lib/wasmBridge";

const PADS = [
  { id: 0, label: "KICK",    key: "Q", instrument: INSTRUMENTS.KICK,  color: "#e8ff47" },
  { id: 1, label: "SNARE",   key: "W", instrument: INSTRUMENTS.SNARE, color: "#ff6b6b" },
  { id: 2, label: "HI-HAT",  key: "E", instrument: INSTRUMENTS.HIHAT, color: "#4ecdc4" },
  { id: 3, label: "CLAP",    key: "R", instrument: INSTRUMENTS.CLAP,  color: "#a78bfa" },
  { id: 4, label: "KICK 2",  key: "A", instrument: INSTRUMENTS.KICK,  color: "#e8ff47" },
  { id: 5, label: "SNARE 2", key: "S", instrument: INSTRUMENTS.SNARE, color: "#ff6b6b" },
  { id: 6, label: "HAT 2",   key: "D", instrument: INSTRUMENTS.HIHAT, color: "#4ecdc4" },
  { id: 7, label: "CLAP 2",  key: "F", instrument: INSTRUMENTS.CLAP,  color: "#a78bfa" },
];

function Pad({ label, keyHint, color, active, onTrigger, isMobile }) {
  return (
    <button
      onMouseDown={onTrigger}
      onTouchStart={(e) => { e.preventDefault(); onTrigger(); }}
      style={{
        width: "100%", aspectRatio: "1", borderRadius: 8, border: "1px solid",
        borderColor: active ? color : "#252525",
        background: active
          ? `radial-gradient(circle at 40% 35%, ${color}33, ${color}11)`
          : "linear-gradient(145deg, #1e1e1e 0%, #141414 100%)",
        cursor: "pointer", position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: isMobile ? 3 : 6,
        transition: "all 0.06s ease",
        boxShadow: active ? `0 0 16px ${color}44` : "none",
        transform: active ? "scale(0.95)" : "scale(1)",
        userSelect: "none", WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: isMobile ? 8 : 10,
        fontWeight: 700, color: active ? color : "#444",
        letterSpacing: "0.1em",
      }}>
        {label}
      </div>
      {!isMobile && (
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9, color: active ? `${color}99` : "#2a2a2a",
        }}>
          [{keyHint}]
        </div>
      )}
      {active && (
        <div style={{
          position: "absolute", bottom: 6, width: 4, height: 4,
          borderRadius: "50%", background: color,
          boxShadow: `0 0 8px ${color}`,
        }} />
      )}
    </button>
  );
}

export default function SamplePads({ engineReady, isMobile }) {
  const [activePads, setActivePads] = useState({});

  const triggerPad = useCallback((pad) => {
    if (!engineReady) return;
    synthTrigger(pad.instrument);
    setActivePads((prev) => ({ ...prev, [pad.id]: true }));
    setTimeout(() => setActivePads((prev) => ({ ...prev, [pad.id]: false })), 120);
  }, [engineReady]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const pad = PADS.find((p) => p.key === e.key.toUpperCase());
      if (pad) triggerPad(pad);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerPad]);

  return (
    <div style={{
      padding: isMobile ? "14px 12px" : "20px 24px",
      background: "linear-gradient(180deg, #161616 0%, #111 100%)",
      borderRadius: 12, border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 12,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 10,
          color: "#444", letterSpacing: "0.2em",
        }}>
          SAMPLE PADS
        </div>
        {!isMobile && (
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: 9,
            color: "#2a2a2a", letterSpacing: "0.1em",
          }}>
            Q W E R · A S D F
          </div>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: isMobile ? 6 : 8,
        width: isMobile ? "100%" : 220,
      }}>
        {PADS.map((pad) => (
          <Pad
            key={pad.id} label={pad.label} keyHint={pad.key}
            color={pad.color} active={!!activePads[pad.id]}
            onTrigger={() => triggerPad(pad)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}