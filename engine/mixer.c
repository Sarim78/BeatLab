#include "mixer.h"
#include <string.h>
#include <math.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#define EXPORT
#endif

// Internal helpers

/* Clamp a float between min and max */
static float clampf(float val, float min, float max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

/* Check if any channel is soloed */
static int any_solo(MixerState *mixer) {
    for (int i = 0; i < CHANNEL_COUNT; i++) {
        if (mixer->channels[i].solo) return 1;
    }
    return 0;
}

/* Compute RMS level of a buffer for VU meter */
static float compute_rms(float *buffer, int length) {
    float sum = 0.0f;
    for (int i = 0; i < length; i++) {
        sum += buffer[i] * buffer[i];
    }
    return sqrtf(sum / (float)length);
}

// Public API

EXPORT
void mixer_init(MixerState *mixer) {
    memset(mixer, 0, sizeof(MixerState));
    mixer->master_volume = 1.0f;

    for (int i = 0; i < CHANNEL_COUNT; i++) {
        mixer->channels[i].volume = 0.8f;
        mixer->channels[i].pan    = 0.0f;   /* center */
        mixer->channels[i].muted  = 0;
        mixer->channels[i].solo   = 0;
        mixer->channels[i].level  = 0.0f;
    }
}

EXPORT
void mixer_set_volume(MixerState *mixer, int channel, float volume) {
    if (channel < 0 || channel >= CHANNEL_COUNT) return;
    mixer->channels[channel].volume = clampf(volume, 0.0f, 1.0f);
}

EXPORT
void mixer_set_pan(MixerState *mixer, int channel, float pan) {
    if (channel < 0 || channel >= CHANNEL_COUNT) return;
    mixer->channels[channel].pan = clampf(pan, -1.0f, 1.0f);
}

EXPORT
int mixer_toggle_mute(MixerState *mixer, int channel) {
    if (channel < 0 || channel >= CHANNEL_COUNT) return -1;
    mixer->channels[channel].muted = !mixer->channels[channel].muted;
    return mixer->channels[channel].muted;
}

EXPORT
int mixer_toggle_solo(MixerState *mixer, int channel) {
    if (channel < 0 || channel >= CHANNEL_COUNT) return -1;
    mixer->channels[channel].solo = !mixer->channels[channel].solo;
    return mixer->channels[channel].solo;
}

EXPORT
void mixer_set_master(MixerState *mixer, float volume) {
    mixer->master_volume = clampf(volume, 0.0f, 1.0f);
}

EXPORT
void mixer_process(MixerState *mixer, float **channel_buffers, float *output) {
    int solo_active = any_solo(mixer);

    /* Zero output buffer */
    memset(output, 0, BUFFER_SIZE * sizeof(float));

    for (int i = 0; i < CHANNEL_COUNT; i++) {
        Channel *ch = &mixer->channels[i];

        /* Skip if muted */
        if (ch->muted) {
            ch->level = 0.0f;
            continue;
        }

        /* Skip if another channel is soloed and this one isn't */
        if (solo_active && !ch->solo) {
            ch->level = 0.0f;
            continue;
        }

        /* Update VU meter level */
        ch->level = compute_rms(channel_buffers[i], BUFFER_SIZE);

        /* Mix channel into output with volume and master */
        float gain = ch->volume * mixer->master_volume;

        for (int s = 0; s < BUFFER_SIZE; s++) {
            output[s] += channel_buffers[i][s] * gain;
        }
    }

    /* Final soft clip on master output */
    for (int s = 0; s < BUFFER_SIZE; s++) {
        if      (output[s] >  1.0f) output[s] =  1.0f;
        else if (output[s] < -1.0f) output[s] = -1.0f;
    }
}

EXPORT
float mixer_get_level(MixerState *mixer, int channel) {
    if (channel < 0 || channel >= CHANNEL_COUNT) return 0.0f;
    return mixer->channels[channel].level;
}