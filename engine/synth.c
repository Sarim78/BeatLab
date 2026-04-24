#include "synth.h"
#include <math.h>
#include <string.h>
#include <stdlib.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Internal helpers

/* Generate a single sample for a given wave type and phase */
static float generate_sample(WaveType wave, float phase, float elapsed) {
    switch (wave) {
        case WAVE_SINE:
            return sinf(2.0f * (float)M_PI * phase);

        case WAVE_SQUARE:
            return (sinf(2.0f * (float)M_PI * phase) >= 0.0f) ? 1.0f : -1.0f;

        case WAVE_TRIANGLE:
            return 2.0f * fabsf(2.0f * (phase - floorf(phase + 0.5f))) - 1.0f;

        case WAVE_NOISE:
            return ((float)rand() / (float)RAND_MAX) * 2.0f - 1.0f;

        default:
            return 0.0f;
    }
}

/* Compute ADSR envelope amplitude at a given elapsed time */
static float compute_envelope(const Envelope *env, float elapsed) {
    float total = env->attack + env->decay + env->release;

    if (elapsed < env->attack) {
        /* Attack phase - ramp up */
        return elapsed / env->attack;
    } else if (elapsed < env->attack + env->decay) {
        /* Decay phase - fall to sustain */
        float t = (elapsed - env->attack) / env->decay;
        return 1.0f - t * (1.0f - env->sustain);
    } else if (elapsed < total) {
        /* Release phase - fade out */
        float t = (elapsed - env->attack - env->decay) / env->release;
        return env->sustain * (1.0f - t);
    }

    return 0.0f; /* voice is done */
}

/* Find a free (inactive) voice slot */
static int find_free_voice(SynthState *synth) {
    for (int i = 0; i < MAX_VOICES; i++) {
        if (!synth->voices[i].active) return i;
    }
    /* No free voice - steal the oldest (voice 0) */
    return 0;
}

// Default voice presets per instrument
EXPORT
Voice synth_get_default_voice(InstrumentType instrument) {
    Voice v;
    memset(&v, 0, sizeof(Voice));
    v.instrument = instrument;
    v.active     = 0;
    v.phase      = 0.0f;
    v.elapsed    = 0.0f;

    switch (instrument) {
        case INSTRUMENT_KICK:
            v.wave             = WAVE_SINE;
            v.frequency        = 60.0f;
            v.amplitude        = 1.0f;
            v.envelope.attack  = 0.005f;
            v.envelope.decay   = 0.15f;
            v.envelope.sustain = 0.0f;
            v.envelope.release = 0.1f;
            break;

        case INSTRUMENT_SNARE:
            v.wave             = WAVE_NOISE;
            v.frequency        = 200.0f;
            v.amplitude        = 0.8f;
            v.envelope.attack  = 0.003f;
            v.envelope.decay   = 0.1f;
            v.envelope.sustain = 0.0f;
            v.envelope.release = 0.05f;
            break;

        case INSTRUMENT_HIHAT:
            v.wave             = WAVE_NOISE;
            v.frequency        = 8000.0f;
            v.amplitude        = 0.5f;
            v.envelope.attack  = 0.001f;
            v.envelope.decay   = 0.05f;
            v.envelope.sustain = 0.0f;
            v.envelope.release = 0.02f;
            break;

        case INSTRUMENT_CLAP:
            v.wave             = WAVE_NOISE;
            v.frequency        = 1000.0f;
            v.amplitude        = 0.7f;
            v.envelope.attack  = 0.002f;
            v.envelope.decay   = 0.08f;
            v.envelope.sustain = 0.0f;
            v.envelope.release = 0.04f;
            break;

        default:
            break;
    }

    return v;
}

// Public API
EXPORT
void synth_init(SynthState *synth) {
    memset(synth, 0, sizeof(SynthState));
    synth->sample_rate = (float)SAMPLE_RATE;
    synth->voice_count = 0;
}

EXPORT
void synth_trigger(SynthState *synth, InstrumentType instrument) {
    int slot = find_free_voice(synth);
    synth->voices[slot]         = synth_get_default_voice(instrument);
    synth->voices[slot].active  = 1;
    synth->voices[slot].elapsed = 0.0f;
    synth->voices[slot].phase   = 0.0f;
}

EXPORT
void synth_process(SynthState *synth, float *output) {
    float dt = 1.0f / synth->sample_rate;

    /* Zero output buffer */
    memset(output, 0, BUFFER_SIZE * sizeof(float));

    for (int i = 0; i < MAX_VOICES; i++) {
        Voice *v = &synth->voices[i];
        if (!v->active) continue;

        for (int s = 0; s < BUFFER_SIZE; s++) {
            float env_amp = compute_envelope(&v->envelope, v->elapsed);

            /* Deactivate voice when envelope is done */
            if (env_amp <= 0.0f && v->elapsed > v->envelope.attack) {
                v->active = 0;
                break;
            }

            float sample = generate_sample(v->wave, v->phase, v->elapsed);
            output[s] += sample * v->amplitude * env_amp;

            /* Advance phase and time */
            v->phase += v->frequency * dt;
            if (v->phase > 1.0f) v->phase -= 1.0f;
            v->elapsed += dt;
        }
    }

    /* Soft clip to prevent distortion */
    for (int s = 0; s < BUFFER_SIZE; s++) {
        if      (output[s] >  1.0f) output[s] =  1.0f;
        else if (output[s] < -1.0f) output[s] = -1.0f;
    }
}

EXPORT
void synth_reset(SynthState *synth) {
    for (int i = 0; i < MAX_VOICES; i++) {
        synth->voices[i].active = 0;
    }
}
