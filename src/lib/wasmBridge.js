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
let outputBufPtr  = null;  /* float[BUFFER_SIZE] for audio output */

const BUFFER_SIZE       = 512;
const INSTRUMENT_COUNT  = 4;
const STEP_COUNT        = 16;

/* ─────────────────────────────────────────
   Load and initialize the WASM module
───────────────────────────────────────── */
export async function initEngine() {
  if (initialized) return true;

  try {
    /* Dynamically import the Emscripten glue */
    const BeatLabEngine = (await import("/beatlab.js")).default;
    Module = await BeatLabEngine();

    /* Allocate structs on the WASM heap */
    synthPtr     = Module._malloc(1024);   /* SynthState */
    sequencerPtr = Module._malloc(1024);   /* SequencerState */
    mixerPtr     = Module._malloc(512);    /* MixerState */
    outputBufPtr = Module._malloc(BUFFER_SIZE * 4); /* float32 array */

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
   Sequencer controls
───────────────────────────────────────── */
export function sequencerPlay() {
  Module._sequencer_play(sequencerPtr);
}

export function sequencerStop() {
  Module._sequencer_stop(sequencerPtr);
}

export function sequencerReset() {
  Module._sequencer_reset(sequencerPtr);
}

export function sequencerSetBpm(bpm) {
  Module._sequencer_set_bpm(sequencerPtr, bpm);
}

export function sequencerGetStep() {
  return Module._sequencer_get_step(sequencerPtr);
}

export function sequencerToggleStep(instrument, step) {
  return Module._sequencer_toggle_step(sequencerPtr, instrument, step);
}

export function sequencerSetStep(instrument, step, active) {
  Module._sequencer_set_step(sequencerPtr, instrument, step, active ? 1 : 0);
}

export function sequencerClearPattern() {
  Module._sequencer_clear_pattern(sequencerPtr);
}

/* Advance sequencer by dt seconds — returns 1 if new step reached */
export function sequencerTick(dt) {
  return Module._sequencer_tick(sequencerPtr, synthPtr, dt);
}

/* ─────────────────────────────────────────
   Synth controls
───────────────────────────────────────── */
export function synthTrigger(instrument) {
  Module._synth_trigger(synthPtr, instrument);
}

export function synthReset() {
  Module._synth_reset(synthPtr);
}

/* Generate next audio buffer — returns Float32Array of BUFFER_SIZE samples */
export function synthProcess() {
  Module._synth_process(synthPtr, outputBufPtr);
  /* Read float32 samples from WASM heap */
  return new Float32Array(
    Module.HEAPF32.buffer,
    outputBufPtr,
    BUFFER_SIZE
  );
}

/* ─────────────────────────────────────────
   Mixer controls
───────────────────────────────────────── */
export function mixerSetVolume(channel, volume) {
  Module._mixer_set_volume(mixerPtr, channel, volume);
}

export function mixerSetPan(channel, pan) {
  Module._mixer_set_pan(mixerPtr, channel, pan);
}

export function mixerToggleMute(channel) {
  return Module._mixer_toggle_mute(mixerPtr, channel);
}

export function mixerToggleSolo(channel) {
  return Module._mixer_toggle_solo(mixerPtr, channel);
}

export function mixerSetMaster(volume) {
  Module._mixer_set_master(mixerPtr, volume);
}

export function mixerGetLevel(channel) {
  return Module._mixer_get_level(mixerPtr, channel);
}

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