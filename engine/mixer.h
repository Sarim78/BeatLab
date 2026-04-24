#ifndef MIXER_H
#define MIXER_H

#include "synth.h"

// Mixer config
#define CHANNEL_COUNT   INSTRUMENT_COUNT   /* one channel per instrument */

// A single mixer channel
typedef struct {
    float   volume;     /* 0.0 to 1.0 */
    float   pan;        /* -1.0 (left) to 1.0 (right), 0.0 = center */
    int     muted;      /* 1 = muted, 0 = active */
    int     solo;       /* 1 = soloed, 0 = normal */
    float   level;      /* current output level for VU meter, 0.0 to 1.0 */
} Channel;

// Mixer state
typedef struct {
    Channel channels[CHANNEL_COUNT];
    float   master_volume;  /* 0.0 to 1.0 */
} MixerState;

// Function declarations

/* Initialize mixer with default volumes */
void  mixer_init(MixerState *mixer);

/* Set volume for a channel (0.0 to 1.0) */
void  mixer_set_volume(MixerState *mixer, int channel, float volume);

/* Set pan for a channel (-1.0 to 1.0) */
void  mixer_set_pan(MixerState *mixer, int channel, float pan);

/* Toggle mute on a channel — returns new mute state */
int   mixer_toggle_mute(MixerState *mixer, int channel);

/* Toggle solo on a channel — returns new solo state */
int   mixer_toggle_solo(MixerState *mixer, int channel);

/* Set master volume (0.0 to 1.0) */
void  mixer_set_master(MixerState *mixer, float volume);

/* Apply mixer to a buffer — scales each channel's contribution */
void  mixer_process(MixerState *mixer, float **channel_buffers, float *output);

/* Get current level of a channel (for VU meter) */
float mixer_get_level(MixerState *mixer, int channel);

#endif /* MIXER_H */