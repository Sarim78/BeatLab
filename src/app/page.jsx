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

export default function BeatLabPage() {
  const [bpm, setBpmState] = useState(120);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const {
    engineReady, isPlaying, currentStep, levels,
    play, stop, reset, setBpm,
  } = useAudio();

  const {
    grid, toggleStep, clearPattern, loadDefault, INSTRUMENT_LABELS,
  } = useSequencer(engineReady);

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
      padding: isMobile ? "12px" : "24px",
      boxSizing: "border-box",
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 10 : 16,
      }}>

        <Transport
          isPlaying={isPlaying}
          engineReady={engineReady}
          onPlay={play}
          onStop={stop}
          onReset={reset}
          bpm={bpm}
          onBpmChange={handleBpmChange}
          isMobile={isMobile}
        />

        <Visualizer
          isPlaying={isPlaying}
          currentStep={currentStep}
          levels={levels}
          isMobile={isMobile}
        />

        <Sequencer
          grid={grid}
          currentStep={currentStep}
          isPlaying={isPlaying}
          engineReady={engineReady}
          onToggleStep={toggleStep}
          onClear={clearPattern}
          onLoadDefault={loadDefault}
          INSTRUMENT_LABELS={INSTRUMENT_LABELS}
          isMobile={isMobile}
        />

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
          gap: isMobile ? 10 : 16,
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
            isMobile={isMobile}
          />
          <SamplePads engineReady={engineReady} isMobile={isMobile} />
        </div>

      </div>
    </main>
  );
}