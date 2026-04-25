/**
 * wasmBridge.js
 * BeatLab — JS <-> C WebAssembly Bridge
 * Loads the compiled C engine and exposes clean JS functions
 */

let Module = null;
let initialized = false;

/* ─────────────────────────────────────────
   Pointers — allocated once on the WASM heap
───────────────────────────────────────── */
let synthPtr      = null;
let sequencerPtr  = null;
let mixerPtr      = null;
let outputBufPtr  = null;

const BUFFER_SIZE      = 512;
const INSTRUMENT_COUNT = 4;
const STEP_COUNT       = 16;

/* ─────────────────────────────────────────
   Load Emscripten glue via <script> tag
   Most reliable way to get it into global scope
───────────────────────────────────────── */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src     = src;
    script.onload  = resolve;
    script.onerror = () =>
      reject(new Error(
        `Failed to load ${src} — run 'cd engine && make' to compile the C engine first`
      ));
    document.head.appendChild(script);
  });
}

/* ─────────────────────────────────────────
   Load and initialize the WASM module
───────────────────────────────────────── */
export async function initEngine() {
  if (initialized) return true;

  try {
    /* Inject beatlab.js — Emscripten sets window.BeatLabEngine */
    await loadScript("/beatlab.js");

    if (typeof window.BeatLabEngine !== "function") {
      throw new Error(
        "window.BeatLabEngine not found — check Makefile EXPORT_NAME matches 'BeatLabEngine'"
      );
    }

    Module = await window.BeatLabEngine();

    /* Allocate structs on the WASM heap */
    synthPtr     = Module._malloc(1024);
    sequencerPtr = Module._malloc(1024);
    mixerPtr     = Module._malloc(512);
    outputBufPtr = Module._malloc(BUFFER_SIZE * 4);

    /* Initialize each engine component */
    Module._synth_init(synthPtr);
    Module._sequencer_init(sequencerPtr);
    Module._mixer_init(mixerPtr);

    initialized = true;
    console.log("[BeatLab] Engine initialized");
    return true;
  } catch (err) {
    console.error("[BeatLab] Engine init failed:", err);
    return false;
  }
}

/* ─────────────────────────────────────────
   Guard — skip call if engine not ready
───────────────────────────────────────── */
function ready() { return Module !== null && initialized; }

/* ─────────────────────────────────────────
   Sequencer controls
───────────────────────────────────────── */
export function sequencerPlay()                            { if (!ready()) return;   Module._sequencer_play(sequencerPtr); }
export function sequencerStop()                            { if (!ready()) return;   Module._sequencer_stop(sequencerPtr); }
export function sequencerReset()                           { if (!ready()) return;   Module._sequencer_reset(sequencerPtr); }
export function sequencerSetBpm(bpm)                       { if (!ready()) return;   Module._sequencer_set_bpm(sequencerPtr, bpm); }
export function sequencerGetStep()                         { if (!ready()) return 0; return Module._sequencer_get_step(sequencerPtr); }
export function sequencerToggleStep(instrument, step)      { if (!ready()) return 0; return Module._sequencer_toggle_step(sequencerPtr, instrument, step); }
export function sequencerSetStep(instrument, step, active) { if (!ready()) return;   Module._sequencer_set_step(sequencerPtr, instrument, step, active ? 1 : 0); }
export function sequencerClearPattern()                    { if (!ready()) return;   Module._sequencer_clear_pattern(sequencerPtr); }
export function sequencerTick(dt)                          { if (!ready()) return 0; return Module._sequencer_tick(sequencerPtr, synthPtr, dt); }

/* ─────────────────────────────────────────
   Synth controls
───────────────────────────────────────── */
export function synthTrigger(instrument) { if (!ready()) return; Module._synth_trigger(synthPtr, instrument); }
export function synthReset()             { if (!ready()) return; Module._synth_reset(synthPtr); }

export function synthProcess() {
  if (!ready()) return new Float32Array(BUFFER_SIZE);
  Module._synth_process(synthPtr, outputBufPtr);
  return new Float32Array(Module.HEAPF32.buffer, outputBufPtr, BUFFER_SIZE);
}

/* ─────────────────────────────────────────
   Mixer controls
───────────────────────────────────────── */
export function mixerSetVolume(channel, volume) { if (!ready()) return;   Module._mixer_set_volume(mixerPtr, channel, volume); }
export function mixerSetPan(channel, pan)       { if (!ready()) return;   Module._mixer_set_pan(mixerPtr, channel, pan); }
export function mixerToggleMute(channel)        { if (!ready()) return 0; return Module._mixer_toggle_mute(mixerPtr, channel); }
export function mixerToggleSolo(channel)        { if (!ready()) return 0; return Module._mixer_toggle_solo(mixerPtr, channel); }
export function mixerSetMaster(volume)          { if (!ready()) return;   Module._mixer_set_master(mixerPtr, volume); }
export function mixerGetLevel(channel)          { if (!ready()) return 0; return Module._mixer_get_level(mixerPtr, channel); }

/* ─────────────────────────────────────────
   Constants (mirrored from C)
───────────────────────────────────────── */
export const INSTRUMENTS = {
  KICK:  0,
  SNARE: 1,
  HIHAT: 2,
  CLAP:  3,
};

export const INSTRUMENT_LABELS = ["Kick", "Snare", "Hi-Hat", "Clap"];

export { BUFFER_SIZE, INSTRUMENT_COUNT, STEP_COUNT };