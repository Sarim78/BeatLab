"use client";

/* ─────────────────────────────────────────
   Step Button
───────────────────────────────────────── */
function StepButton({ active, isCurrent, beat, onClick }) {
  /* beat = true if this is a downbeat (every 4 steps) */
  const isDownbeat = beat % 4 === 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        border: "1px solid",
        borderColor: isCurrent
          ? "#e8ff47"
          : active
          ? "#555"
          : isDownbeat
          ? "#232323"
          : "#1c1c1c",
        background: isCurrent && active
          ? "#e8ff47"
          : isCurrent
          ? "rgba(232,255,71,0.15)"
          : active
          ? "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)"
          : isDownbeat
          ? "#181818"
          : "#141414",
        cursor: "pointer",
        transition: "all 0.07s ease",
        boxShadow: isCurrent && active
          ? "0 0 14px rgba(232,255,71,0.5)"
          : active
          ? "inset 0 1px 0 rgba(255,255,255,0.08)"
          : "none",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!active && !isCurrent) {
          e.currentTarget.style.background = "#1f1f1f";
          e.currentTarget.style.borderColor = "#333";
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !isCurrent) {
          e.currentTarget.style.background = isDownbeat ? "#181818" : "#141414";
          e.currentTarget.style.borderColor = isDownbeat ? "#232323" : "#1c1c1c";
        }
      }}
    >
      {/* Active indicator pip */}
      {active && !isCurrent && (
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#e8ff47",
          position: "absolute",
          bottom: 5,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 0 6px rgba(232,255,71,0.6)",
        }} />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────
   Instrument Row
───────────────────────────────────────── */
function InstrumentRow({ label, color, steps, currentStep, isPlaying, onToggle }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      {/* Label */}
      <div style={{
        width: 56,
        fontFamily: "'Courier New', monospace",
        fontSize: 11,
        fontWeight: 700,
        color: color,
        letterSpacing: "0.1em",
        textAlign: "right",
        flexShrink: 0,
      }}>
        {label}
      </div>

      {/* Steps — grouped in sets of 4 */}
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 4, 8, 12].map((groupStart) => (
          <div key={groupStart} style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3].map((offset) => {
              const step = groupStart + offset;
              return (
                <StepButton
                  key={step}
                  active={steps[step]}
                  isCurrent={isPlaying && currentStep === step}
                  beat={step}
                  onClick={() => onToggle(step)}
                />
              );
            })}
            {/* Group gap */}
            {groupStart < 12 && (
              <div style={{ width: 6 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Step Number Header
───────────────────────────────────────── */
function StepHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 56 }} />
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 4, 8, 12].map((groupStart) => (
          <div key={groupStart} style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3].map((offset) => {
              const step = groupStart + offset;
              const isDownbeat = step % 4 === 0;
              return (
                <div
                  key={step}
                  style={{
                    width: 40,
                    textAlign: "center",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9,
                    color: isDownbeat ? "#444" : "#2a2a2a",
                    letterSpacing: "0.05em",
                  }}
                >
                  {isDownbeat ? step / 4 + 1 : "·"}
                </div>
              );
            })}
            {groupStart < 12 && <div style={{ width: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Instrument colors
───────────────────────────────────────── */
const INSTRUMENT_COLORS = ["#e8ff47", "#ff6b6b", "#4ecdc4", "#a78bfa"];

/* ─────────────────────────────────────────
   Sequencer Component
───────────────────────────────────────── */
export default function Sequencer({
  grid,
  currentStep,
  isPlaying,
  engineReady,
  onToggleStep,
  onClear,
  onLoadDefault,
  INSTRUMENT_LABELS,
}) {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: "#444",
          letterSpacing: "0.2em",
        }}>
          STEP SEQUENCER — 16
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onLoadDefault}
            disabled={!engineReady}
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              border: "1px solid #2a2a2a",
              background: "transparent",
              color: "#444",
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              cursor: engineReady ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e8ff47";
              e.currentTarget.style.borderColor = "#e8ff47";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#444";
              e.currentTarget.style.borderColor = "#2a2a2a";
            }}
          >
            DEFAULT
          </button>

          <button
            onClick={onClear}
            disabled={!engineReady}
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              border: "1px solid #2a2a2a",
              background: "transparent",
              color: "#444",
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              letterSpacing: "0.1em",
              cursor: engineReady ? "pointer" : "not-allowed",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff6b6b";
              e.currentTarget.style.borderColor = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#444";
              e.currentTarget.style.borderColor = "#2a2a2a";
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Step number header */}
      <div style={{ marginBottom: 10 }}>
        <StepHeader />
      </div>

      {/* Instrument rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {INSTRUMENT_LABELS.map((label, i) => (
          <InstrumentRow
            key={label}
            label={label}
            color={INSTRUMENT_COLORS[i]}
            steps={grid[i]}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onToggle={(step) => onToggleStep(i, step)}
          />
        ))}
      </div>

    </div>
  );
}