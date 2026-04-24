"use client";

import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   VU Meter
───────────────────────────────────────── */
function VuMeter({ level }) {
  const segments = 12;
  const filled = Math.round(level * segments);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column-reverse",
      gap: 2,
      height: 80,
      justifyContent: "flex-start",
    }}>
      {Array.from({ length: segments }, (_, i) => {
        const active = i < filled;
        const isHot  = i >= 10;
        const isMid  = i >= 7;

        return (
          <div
            key={i}
            style={{
              width: 20,
              height: 4,
              borderRadius: 2,
              background: active
                ? isHot  ? "#ff4444"
                : isMid  ? "#ffaa00"
                :          "#4ade80"
                : "#1e1e1e",
              boxShadow: active
                ? isHot  ? "0 0 4px rgba(255,68,68,0.6)"
                : isMid  ? "0 0 4px rgba(255,170,0,0.5)"
                :          "0 0 4px rgba(74,222,128,0.4)"
                : "none",
              transition: "background 0.05s ease, box-shadow 0.05s ease",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Vertical Fader
───────────────────────────────────────── */
function Fader({ value, onChange }) {
  const trackRef  = useRef(null);
  const dragging  = useRef(false);

  const handleMouseDown = (e) => {
    dragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragging.current || !trackRef.current) return;
    const rect   = trackRef.current.getBoundingClientRect();
    const raw    = 1 - (e.clientY - rect.top) / rect.height;
    onChange(Math.min(1, Math.max(0, raw)));
  };

  const handleMouseUp = () => { dragging.current = false; };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",  handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",  handleMouseUp);
    };
  }, []);

  const thumbPos = (1 - value) * 80; /* px from top */

  return (
    <div
      ref={trackRef}
      style={{
        width: 6,
        height: 100,
        background: "#1a1a1a",
        borderRadius: 3,
        border: "1px solid #2a2a2a",
        position: "relative",
        cursor: "pointer",
        margin: "0 auto",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Fill */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: `${value * 100}%`,
        background: "linear-gradient(0deg, #e8ff47, #a8c020)",
        borderRadius: 3,
        opacity: 0.6,
      }} />
      {/* Thumb */}
      <div style={{
        position: "absolute",
        top: thumbPos,
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 18,
        height: 8,
        borderRadius: 3,
        background: "linear-gradient(180deg, #3a3a3a, #222)",
        border: "1px solid #555",
        boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
        cursor: "ns-resize",
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Channel Strip
───────────────────────────────────────── */
function ChannelStrip({ label, color, volume, level, muted, soloed, onVolumeChange, onMute, onSolo }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      padding: "14px 12px",
      background: muted
        ? "#0e0e0e"
        : "linear-gradient(180deg, #1c1c1c 0%, #141414 100%)",
      borderRadius: 10,
      border: "1px solid",
      borderColor: soloed ? color : muted ? "#1a1a1a" : "#242424",
      boxShadow: soloed ? `0 0 12px ${color}33` : "none",
      transition: "all 0.15s ease",
      minWidth: 64,
    }}>

      {/* Label */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 10,
        fontWeight: 700,
        color: muted ? "#333" : color,
        letterSpacing: "0.1em",
        textAlign: "center",
      }}>
        {label}
      </div>

      {/* VU Meter */}
      <VuMeter level={muted ? 0 : level} />

      {/* Fader */}
      <Fader value={volume} onChange={onVolumeChange} />

      {/* Volume % */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 9,
        color: "#333",
        letterSpacing: "0.05em",
      }}>
        {Math.round(volume * 100)}
      </div>

      {/* Mute / Solo buttons */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={onMute}
          style={{
            width: 24,
            height: 18,
            borderRadius: 3,
            border: "1px solid",
            borderColor: muted ? "#ff6b6b" : "#2a2a2a",
            background: muted ? "rgba(255,107,107,0.2)" : "transparent",
            color: muted ? "#ff6b6b" : "#333",
            fontFamily: "'Courier New', monospace",
            fontSize: 8,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "all 0.1s ease",
          }}
        >
          M
        </button>
        <button
          onClick={onSolo}
          style={{
            width: 24,
            height: 18,
            borderRadius: 3,
            border: "1px solid",
            borderColor: soloed ? "#e8ff47" : "#2a2a2a",
            background: soloed ? "rgba(232,255,71,0.15)" : "transparent",
            color: soloed ? "#e8ff47" : "#333",
            fontFamily: "'Courier New', monospace",
            fontSize: 8,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "all 0.1s ease",
          }}
        >
          S
        </button>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────
   Instrument colors
───────────────────────────────────────── */
const INSTRUMENT_COLORS = ["#e8ff47", "#ff6b6b", "#4ecdc4", "#a78bfa"];

/* ─────────────────────────────────────────
   Mixer Component
───────────────────────────────────────── */
export default function Mixer({
  levels,
  engineReady,
  INSTRUMENT_LABELS,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onMasterChange,
}) {
  const [volumes,      setVolumes]      = useState(Array(4).fill(0.8));
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [muted,        setMuted]        = useState(Array(4).fill(false));
  const [soloed,       setSoloed]       = useState(Array(4).fill(false));

  const handleVolume = (i, val) => {
    const next = [...volumes];
    next[i] = val;
    setVolumes(next);
    onVolumeChange?.(i, val);
  };

  const handleMute = (i) => {
    const next = [...muted];
    next[i] = !next[i];
    setMuted(next);
    onMuteToggle?.(i);
  };

  const handleSolo = (i) => {
    const next = [...soloed];
    next[i] = !next[i];
    setSoloed(next);
    onSoloToggle?.(i);
  };

  const handleMaster = (val) => {
    setMasterVolume(val);
    onMasterChange?.(val);
  };

  return (
    <div style={{
      padding: "20px 24px",
      background: "linear-gradient(180deg, #161616 0%, #111 100%)",
      borderRadius: 12,
      border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>

      {/* Header */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 10,
        color: "#444",
        letterSpacing: "0.2em",
        marginBottom: 16,
      }}>
        MIXER
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>

        {/* Channel strips */}
        {INSTRUMENT_LABELS.map((label, i) => (
          <ChannelStrip
            key={label}
            label={label}
            color={INSTRUMENT_COLORS[i]}
            volume={volumes[i]}
            level={levels?.[i] ?? 0}
            muted={muted[i]}
            soloed={soloed[i]}
            onVolumeChange={(val) => handleVolume(i, val)}
            onMute={() => handleMute(i)}
            onSolo={() => handleSolo(i)}
          />
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 160, background: "#2a2a2a", alignSelf: "center" }} />

        {/* Master strip */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "14px 12px",
          background: "linear-gradient(180deg, #1c1c1c 0%, #141414 100%)",
          borderRadius: 10,
          border: "1px solid #2a2a2a",
          minWidth: 64,
        }}>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            fontWeight: 700,
            color: "#666",
            letterSpacing: "0.1em",
          }}>
            MSTR
          </div>

          <VuMeter level={levels ? Math.max(...levels) : 0} />
          <Fader value={masterVolume} onChange={handleMaster} />

          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: "#333",
            letterSpacing: "0.05em",
          }}>
            {Math.round(masterVolume * 100)}
          </div>
        </div>

      </div>
    </div>
  );
}