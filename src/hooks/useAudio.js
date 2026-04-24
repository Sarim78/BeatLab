/**
 * useAudio.js
 * BeatLab — Web Audio API Hook
 * Connects the C/WASM engine output to the browser's audio system
 */

import { useRef, useEffect, useCallback, useState } from "react";
import {
  initEngine,
  synthProcess,
  sequencerTick,
  sequencerPlay,
  sequencerStop,
  sequencerReset,
  sequencerSetBpm,
  sequencerGetStep,
  mixerGetLevel,
  BUFFER_SIZE,
  INSTRUMENT_COUNT,
} from "../lib/wasmBridge";

const SAMPLE_RATE = 44100;

export function useAudio() {
  const audioCtxRef     = useRef(null);
  const processorRef    = useRef(null);
  const engineReadyRef  = useRef(false);
  const playingRef      = useRef(false);
  const lastTimeRef     = useRef(0);

  const [engineReady, setEngineReady] = useState(false);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [levels,      setLevels]      = useState(Array(INSTRUMENT_COUNT).fill(0));

  /* ─────────────────────────────────────────
     Initialize WASM engine on mount
  ───────────────────────────────────────── */
  useEffect(() => {
    initEngine().then((ok) => {
      engineReadyRef.current = ok;
      setEngineReady(ok);
    });
  }, []);

  /* ─────────────────────────────────────────
     Start audio context + script processor
  ───────────────────────────────────────── */
  const startAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });

    /* ScriptProcessorNode pulls audio from C engine each buffer */
    const processor = ctx.createScriptProcessor(BUFFER_SIZE, 0, 1);

    processor.onaudioprocess = (e) => {
      if (!playingRef.current || !engineReadyRef.current) return;

      const now = ctx.currentTime;
      const dt  = lastTimeRef.current ? now - lastTimeRef.current : 0;
      lastTimeRef.current = now;

      /* Tick sequencer — advances steps and triggers synth voices */
      const stepped = sequencerTick(dt);

      /* Get audio buffer from C synth */
      const samples = synthProcess();

      /* Write samples to Web Audio output */
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < BUFFER_SIZE; i++) {
        output[i] = samples[i];
      }

      /* Update UI state — step and VU levels */
      if (stepped) {
        setCurrentStep(sequencerGetStep());
        setLevels(
          Array.from({ length: INSTRUMENT_COUNT }, (_, i) => mixerGetLevel(i))
        );
      }
    };

    processor.connect(ctx.destination);

    audioCtxRef.current  = ctx;
    processorRef.current = processor;
  }, []);

  /* ─────────────────────────────────────────
     Transport controls
  ───────────────────────────────────────── */
  const play = useCallback(() => {
    if (!engineReadyRef.current) return;
    startAudioContext();

    /* Resume context if suspended (browser autoplay policy) */
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    sequencerPlay();
    playingRef.current = true;
    lastTimeRef.current = 0;
    setIsPlaying(true);
  }, [startAudioContext]);

  const stop = useCallback(() => {
    sequencerStop();
    playingRef.current = false;
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    sequencerReset();
    playingRef.current = false;
    setIsPlaying(false);
    setCurrentStep(0);
    setLevels(Array(INSTRUMENT_COUNT).fill(0));
  }, []);

  const setBpm = useCallback((bpm) => {
    sequencerSetBpm(bpm);
  }, []);

  /* ─────────────────────────────────────────
     Cleanup on unmount
  ───────────────────────────────────────── */
  useEffect(() => {
    return () => {
      processorRef.current?.disconnect();
      audioCtxRef.current?.close();
    };
  }, []);

  return {
    engineReady,
    isPlaying,
    currentStep,
    levels,
    play,
    stop,
    reset,
    setBpm,
  };
}