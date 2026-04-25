/**
 * constants.js
 * BeatLab — Shared constants mirrored from C engine
 */

// Audio
export const SAMPLE_RATE  = 44100;
export const BUFFER_SIZE  = 512;

// Sequencer
export const STEP_COUNT       = 16;
export const DEFAULT_BPM      = 120;
export const MIN_BPM          = 60;
export const MAX_BPM          = 200;

// Instruments
export const INSTRUMENT_COUNT = 4;

export const INSTRUMENTS = {
  KICK:  0,
  SNARE: 1,
  HIHAT: 2,
  CLAP:  3,
};

export const INSTRUMENT_LABELS = ["Kick", "Snare", "Hi-Hat", "Clap"];

export const INSTRUMENT_COLORS = [
  "#e8ff47",  /* Kick  — yellow */
  "#ff6b6b",  /* Snare — red    */
  "#4ecdc4",  /* HiHat — teal   */
  "#a78bfa",  /* Clap  — purple */
];

// Mixer
export const DEFAULT_VOLUME        = 0.8;
export const DEFAULT_MASTER_VOLUME = 1.0;

// UI
export const ACCENT_COLOR = "#e8ff47";
export const ACCENT_RGB   = "232,255,71";