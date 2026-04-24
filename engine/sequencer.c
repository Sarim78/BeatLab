#include "sequencer.h"
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

// Internal helpers

/* Calculate step duration in seconds from BPM */
/* One beat = 60/BPM seconds, one step = one 16th note = beat/4 */
static float calc_step_duration(int bpm) {
    return (60.0f / (float)bpm) / 4.0f;
}

// Public API
EXPORT
void sequencer_init(SequencerState *seq) {
    memset(seq, 0, sizeof(SequencerState));
    seq->bpm           = DEFAULT_BPM;
    seq->current_step  = 0;
    seq->playing       = 0;
    seq->step_timer    = 0.0f;
    seq->step_duration = calc_step_duration(DEFAULT_BPM);

    /* Default velocity for all steps */
    for (int i = 0; i < INSTRUMENT_COUNT; i++) {
        for (int s = 0; s < STEP_COUNT; s++) {
            seq->pattern.steps[i][s].active   = 0;
            seq->pattern.steps[i][s].velocity = 1.0f;
        }
    }
}

EXPORT
void sequencer_set_bpm(SequencerState *seq, int bpm) {
    if (bpm < MIN_BPM) bpm = MIN_BPM;
    if (bpm > MAX_BPM) bpm = MAX_BPM;
    seq->bpm           = bpm;
    seq->step_duration = calc_step_duration(bpm);
}

EXPORT
int sequencer_toggle_step(SequencerState *seq, int instrument, int step) {
    if (instrument < 0 || instrument >= INSTRUMENT_COUNT) return -1;
    if (step < 0       || step       >= STEP_COUNT)       return -1;

    int current = seq->pattern.steps[instrument][step].active;
    seq->pattern.steps[instrument][step].active = !current;
    return seq->pattern.steps[instrument][step].active;
}

EXPORT
void sequencer_set_step(SequencerState *seq, int instrument, int step, int active) {
    if (instrument < 0 || instrument >= INSTRUMENT_COUNT) return;
    if (step < 0       || step       >= STEP_COUNT)       return;
    seq->pattern.steps[instrument][step].active = active ? 1 : 0;
}

EXPORT
void sequencer_clear_pattern(SequencerState *seq) {
    for (int i = 0; i < INSTRUMENT_COUNT; i++) {
        for (int s = 0; s < STEP_COUNT; s++) {
            seq->pattern.steps[i][s].active = 0;
        }
    }
}

EXPORT
int sequencer_tick(SequencerState *seq, SynthState *synth, float dt) {
    if (!seq->playing) return 0;

    seq->step_timer += dt;

    /* Check if it's time to advance to the next step */
    if (seq->step_timer < seq->step_duration) return 0;

    /* Advance step */
    seq->step_timer -= seq->step_duration;
    seq->current_step = (seq->current_step + 1) % STEP_COUNT;

    /* Trigger any active instruments on this step */
    for (int i = 0; i < INSTRUMENT_COUNT; i++) {
        if (seq->pattern.steps[i][seq->current_step].active) {
            synth_trigger(synth, (InstrumentType)i);
        }
    }

    return 1; /* new step reached */
}

EXPORT
void sequencer_play(SequencerState *seq) {
    seq->playing    = 1;
    seq->step_timer = 0.0f;
}

EXPORT
void sequencer_stop(SequencerState *seq) {
    seq->playing = 0;
}

EXPORT
void sequencer_reset(SequencerState *seq) {
    seq->playing      = 0;
    seq->current_step = 0;
    seq->step_timer   = 0.0f;
}

EXPORT
int sequencer_get_step(SequencerState *seq) {
    return seq->current_step;
}