"use client";

import { useState, useEffect } from "react";
import Transport    from "../components/Transport";
import Sequencer    from "../components/Sequencer";
import Mixer        from "../components/Mixer";
import Visualizer   from "../components/Visualizer";
import SamplePads   from "../components/SamplePads";
import { useAudio }     from "../hooks/useAudio";
import { useSequencer } from "../hooks/useSequencer";
import {
  mixerSetVolume,
  mixerSetMaster,
  mixerToggleMute,
  mixerToggleSolo,
} from "../lib/wasmBridge";

/* ─────────────────────────────────────────
   Page — root layout
───────────────────────────────────────── */
export default function BeatLabPage() {
  const [bpm, setBpmState] = useState(120);

  /* Audio engine hook */
  const {
    engineReady,
    isPlaying,
    currentStep,
    levels,
    play,
    stop,
    reset,
    setBpm,
  } = useAudio();

  /* Sequencer grid hook */
  const {
    grid,
    toggleStep,
    clearPattern,
    loadDefault,
    INSTRUMENT_LABELS,
  } = useSequencer(engineReady);

  /* Sync default pattern once engine is ready */
  useEffect(() => {
    if (engineReady) loadDefault();
  }, [engineReady]);

  const handleBpmChange = (val) => {
    setBpmState(val);
    setBpm(val);
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "24px",
      boxSizing: "border-box",
    }}>

      {/* Max width container */}
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>

        {/* Transport bar */}
        <Transport
          isPlaying={isPlaying}
          engineReady={engineReady}
          onPlay={play}
          onStop={stop}
          onReset={reset}
          bpm={bpm}
          onBpmChange={handleBpmChange}
        />

        {/* Visualizer */}
        <Visualizer
          isPlaying={isPlaying}
          currentStep={currentStep}
          levels={levels}
        />

        {/* Sequencer */}
        <Sequencer
          grid={grid}
          currentStep={currentStep}
          isPlaying={isPlaying}
          engineReady={engineReady}
          onToggleStep={toggleStep}
          onClear={clearPattern}
          onLoadDefault={loadDefault}
          INSTRUMENT_LABELS={INSTRUMENT_LABELS}
        />

        {/* Bottom row — Mixer + Pads */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          alignItems: "start",
        }}>
          <Mixer
            levels={levels}
            engineReady={engineReady}
            INSTRUMENT_LABELS={INSTRUMENT_LABELS}
            onVolumeChange={(i, val) => mixerSetVolume(i, val)}
            onMuteToggle={(i)        => mixerToggleMute(i)}
            onSoloToggle={(i)        => mixerToggleSolo(i)}
            onMasterChange={(val)    => mixerSetMaster(val)}
          />

          <SamplePads engineReady={engineReady} />
        </div>

      </div>
    </main>
  );
}