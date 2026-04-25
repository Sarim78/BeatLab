"use client";

function StepButton({ active, isCurrent, beat, onClick, size }) {
  const isDownbeat = beat % 4 === 0;
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: 4, border: "1px solid",
        borderColor: isCurrent ? "#e8ff47" : active ? "#555" : isDownbeat ? "#232323" : "#1c1c1c",
        background: isCurrent && active ? "#e8ff47"
          : isCurrent ? "rgba(232,255,71,0.15)"
          : active ? "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)"
          : isDownbeat ? "#181818" : "#141414",
        cursor: "pointer", transition: "all 0.07s ease",
        boxShadow: isCurrent && active ? "0 0 10px rgba(232,255,71,0.5)" : "none",
        position: "relative", flexShrink: 0,
      }}
    >
      {active && !isCurrent && (
        <div style={{
          width: 4, height: 4, borderRadius: "50%", background: "#e8ff47",
          position: "absolute", bottom: 3, left: "50%",
          transform: "translateX(-50%)", boxShadow: "0 0 4px rgba(232,255,71,0.6)",
        }} />
      )}
    </button>
  );
}

function InstrumentRow({ label, color, steps, currentStep, isPlaying, onToggle, stepSize, gap }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 44, fontFamily: "'Courier New', monospace", fontSize: 9,
        fontWeight: 700, color, letterSpacing: "0.08em",
        textAlign: "right", flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: gap, flexWrap: "nowrap" }}>
        {[0, 4, 8, 12].map((groupStart) => (
          <div key={groupStart} style={{ display: "flex", gap: Math.max(2, gap - 1) }}>
            {[0, 1, 2, 3].map((offset) => {
              const step = groupStart + offset;
              return (
                <StepButton
                  key={step}
                  active={steps[step]}
                  isCurrent={isPlaying && currentStep === step}
                  beat={step}
                  onClick={() => onToggle(step)}
                  size={stepSize}
                />
              );
            })}
            {groupStart < 12 && <div style={{ width: gap }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

const INSTRUMENT_COLORS = ["#e8ff47", "#ff6b6b", "#4ecdc4", "#a78bfa"];

export default function Sequencer({
  grid, currentStep, isPlaying, engineReady,
  onToggleStep, onClear, onLoadDefault, INSTRUMENT_LABELS, isMobile,
}) {
  const stepSize = isMobile ? 18 : 38;
  const gap      = isMobile ? 3 : 4;

  return (
    <div style={{
      padding: isMobile ? "14px 12px" : "20px 24px",
      background: "linear-gradient(180deg, #161616 0%, #111 100%)",
      borderRadius: 12, border: "1px solid #2a2a2a",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      overflowX: "auto",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 14,
      }}>
        <div style={{
          fontFamily: "'Courier New', monospace", fontSize: 10,
          color: "#444", letterSpacing: "0.2em",
        }}>
          STEP SEQUENCER — 16
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["DEFAULT", "#e8ff47", onLoadDefault], ["CLEAR", "#ff6b6b", onClear]].map(([label, hoverColor, action]) => (
            <button key={label} onClick={action} disabled={!engineReady}
              style={{
                padding: "4px 10px", borderRadius: 4,
                border: "1px solid #2a2a2a", background: "transparent",
                color: "#444", fontFamily: "'Courier New', monospace",
                fontSize: 9, letterSpacing: "0.1em",
                cursor: engineReady ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = hoverColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8, minWidth: "fit-content" }}>
        {INSTRUMENT_LABELS.map((label, i) => (
          <InstrumentRow
            key={label} label={label} color={INSTRUMENT_COLORS[i]}
            steps={grid[i]} currentStep={currentStep} isPlaying={isPlaying}
            onToggle={(step) => onToggleStep(i, step)}
            stepSize={stepSize} gap={gap}
          />
        ))}
      </div>
    </div>
  );
}