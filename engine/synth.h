#ifndef SYNTH_H
#define SYNTH_H

#include <stdint.h>

// Sample rate & buffer config
#define SAMPLE_RATE     44100
#define BUFFER_SIZE     512


// Instrument types
typedef enum {
    INSTRUMENT_KICK  = 0,
    INSTRUMENT_SNARE = 1,
    INSTRUMENT_HIHAT = 2,
    INSTRUMENT_CLAP  = 3,
    INSTRUMENT_COUNT = 4
} InstrumentType;

// Waveform types
typedef enum {
    WAVE_SINE     = 0,
    WAVE_SQUARE   = 1,
    WAVE_TRIANGLE = 2,
    WAVE_NOISE    = 3
} WaveType;

/* ─────────────────────────────────────────
   Envelope (ADSR)
   Controls how a sound evolves over time
───────────────────────────────────────── */
typedef struct {
    float attack;   /* seconds — time to reach peak */
    float decay;    /* seconds — time to fall to sustain level */
    float sustain;  /* 0.0 to 1.0 — amplitude during sustain */
    float release;  /* seconds — time to fade to silence */
} Envelope;

/* ─────────────────────────────────────────
   Voice
   A single playing instance of an instrument
───────────────────────────────────────── */
typedef struct {
    InstrumentType  instrument;
    WaveType        wave;
    float           frequency;      /* Hz */
    float           amplitude;      /* 0.0 to 1.0 */
    Envelope        envelope;
    float           phase;          /* current waveform phase */
    float           elapsed;        /* seconds since note trigger */
    int             active;         /* 1 = playing, 0 = silent */
} Voice;

// Synth state
#define MAX_VOICES 16

typedef struct {
    Voice   voices[MAX_VOICES];
    int     voice_count;
    float   sample_rate;
} SynthState;


// Function declarations

/* Initialize the synth */
void synth_init(SynthState *synth);

/* Trigger an instrument — finds a free voice and starts it */
void synth_trigger(SynthState *synth, InstrumentType instrument);

/* Generate the next buffer of audio samples */
/* output: float array of length BUFFER_SIZE, range -1.0 to 1.0 */
void synth_process(SynthState *synth, float *output);

/* Stop all active voices */
void synth_reset(SynthState *synth);

/* Get default voice settings per instrument type */
Voice synth_get_default_voice(InstrumentType instrument);

#endif /* SYNTH_H */