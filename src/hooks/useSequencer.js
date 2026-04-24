/**
 * useSequencer.js
 * BeatLab — Sequencer Grid State Hook
 * Manages the 16-step pattern grid in React state
 * and syncs changes down to the C engine via wasmBridge
 */

import { useState, useCallback } from "react";
import {
  sequencerToggleStep,
  sequencerSetStep,
  sequencerClearPattern,
  INSTRUMENT_COUNT,
  STEP_COUNT,
  INSTRUMENT_LABELS,
} from "../lib/wasmBridge";

/* ─────────────────────────────────────────
   Build an empty 4x16 grid
───────────────────────────────────────── */
function buildEmptyGrid() {
  return Array.from({ length: INSTRUMENT_COUNT }, () =>
    Array(STEP_COUNT).fill(false)
  );
}

/* ─────────────────────────────────────────
   Default pattern — a basic 4/4 beat
   Kick: 0, 4, 8, 12
   Snare: 4, 12
   HiHat: every even step
   Clap: 4, 12
───────────────────────────────────────── */
function buildDefaultPattern() {
  const grid = buildEmptyGrid();

  /* Kick */
  [0, 4, 8, 12].forEach((s) => (grid[0][s] = true));
  /* Snare */
  [4, 12].forEach((s) => (grid[1][s] = true));
  /* Hi-Hat */
  [0, 2, 4, 6, 8, 10, 12, 14].forEach((s) => (grid[2][s] = true));
  /* Clap */
  [4, 12].forEach((s) => (grid[3][s] = true));

  return grid;
}

export function useSequencer(engineReady) {
  const [grid, setGrid] = useState(buildDefaultPattern);

  /* ─────────────────────────────────────────
     Sync default pattern to C engine once ready
  ───────────────────────────────────────── */
  const syncPatternToEngine = useCallback(
    (pattern) => {
      if (!engineReady) return;
      for (let i = 0; i < INSTRUMENT_COUNT; i++) {
        for (let s = 0; s < STEP_COUNT; s++) {
          sequencerSetStep(i, s, pattern[i][s] ? 1 : 0);
        }
      }
    },
    [engineReady]
  );

  /* ─────────────────────────────────────────
     Toggle a single step
  ───────────────────────────────────────── */
  const toggleStep = useCallback(
    (instrument, step) => {
      if (!engineReady) return;

      /* Update C engine */
      const newState = sequencerToggleStep(instrument, step);

      /* Update React state */
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[instrument][step] = newState === 1;
        return next;
      });
    },
    [engineReady]
  );

  /* ─────────────────────────────────────────
     Clear all steps
  ───────────────────────────────────────── */
  const clearPattern = useCallback(() => {
    if (!engineReady) return;
    sequencerClearPattern();
    setGrid(buildEmptyGrid());
  }, [engineReady]);

  /* ─────────────────────────────────────────
     Load default pattern
  ───────────────────────────────────────── */
  const loadDefault = useCallback(() => {
    if (!engineReady) return;
    const pattern = buildDefaultPattern();
    syncPatternToEngine(pattern);
    setGrid(pattern);
  }, [engineReady, syncPatternToEngine]);

  /* ─────────────────────────────────────────
     Load a custom pattern (2D boolean array)
  ───────────────────────────────────────── */
  const loadPattern = useCallback(
    (pattern) => {
      if (!engineReady) return;
      syncPatternToEngine(pattern);
      setGrid(pattern.map((row) => [...row]));
    },
    [engineReady, syncPatternToEngine]
  );

  return {
    grid,
    toggleStep,
    clearPattern,
    loadDefault,
    loadPattern,
    INSTRUMENT_LABELS,
    STEP_COUNT,
    INSTRUMENT_COUNT,
  };
}