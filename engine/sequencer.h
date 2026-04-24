#ifndef SEQUENCER_H
#define SEQUENCER_H

#include "synth.h"

// Sequencer config
#define STEP_COUNT      16   /* steps per pattern */
#define DEFAULT_BPM     120
#define MIN_BPM         60
#define MAX_BPM         200

// A single step in the pattern
typedef struct {
    int active;         /* 1 = on, 0 = off */
    float velocity;     /* 0.0 to 1.0 */
} Step;

// A pattern — one row per instrument
typedef struct {
    Step steps[INSTRUMENT_COUNT][STEP_COUNT];
} Pattern;

// Sequencer state
typedef struct {
    Pattern     pattern;
    int         current_step;      /* 0 to STEP_COUNT-1 */
    int         bpm;
    int         playing;           /* 1 = running, 0 = stopped */
    float       step_timer;        /* seconds elapsed on current step */
    float       step_duration;     /* seconds per step (derived from bpm) */
} SequencerState;

// Function declarations

/* Initialize sequencer with default BPM and empty pattern */
void sequencer_init(SequencerState *seq);

/* Set BPM and recalculate step duration */
void sequencer_set_bpm(SequencerState *seq, int bpm);

/* Toggle a step on/off — returns new state (1 or 0) */
int  sequencer_toggle_step(SequencerState *seq, int instrument, int step);

/* Set a step explicitly */
void sequencer_set_step(SequencerState *seq, int instrument, int step, int active);

/* Clear all steps for all instruments */
void sequencer_clear_pattern(SequencerState *seq);

/* Advance the sequencer by dt seconds — triggers voices via synth */
/* Returns 1 if a new step was reached, 0 otherwise */
int  sequencer_tick(SequencerState *seq, SynthState *synth, float dt);

/* Transport controls */
void sequencer_play(SequencerState *seq);
void sequencer_stop(SequencerState *seq);
void sequencer_reset(SequencerState *seq);

/* Get current step index */
int  sequencer_get_step(SequencerState *seq);

#endif /* SEQUENCER_H */