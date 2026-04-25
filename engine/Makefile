# BeatLab — Emscripten Build Config (Windows)

CC      = emcc
SOURCES = synth.c sequencer.c mixer.c
OUTPUT  = ..\public\beatlab.js

FLAGS = \
	-O2 \
	-s WASM=1 \
	-s EXPORT_ES6=1 \
	-s EXPORTED_FUNCTIONS="['_synth_init','_synth_trigger','_synth_process','_synth_reset','_synth_get_default_voice','_sequencer_init','_sequencer_set_bpm','_sequencer_toggle_step','_sequencer_set_step','_sequencer_clear_pattern','_sequencer_tick','_sequencer_play','_sequencer_stop','_sequencer_reset','_sequencer_get_step','_mixer_init','_mixer_set_volume','_mixer_set_pan','_mixer_toggle_mute','_mixer_toggle_solo','_mixer_set_master','_mixer_process','_mixer_get_level','_malloc','_free']" \
	-s EXPORTED_RUNTIME_METHODS="['ccall','cwrap','getValue','setValue','HEAPF32','HEAP32']" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT="web" \
	-lm

all:
	$(CC) $(SOURCES) $(FLAGS) -o $(OUTPUT)
	@echo Built successfully

clean:
	-del /Q /F ..\public\beatlab.js ..\public\beatlab.wasm

rebuild: clean all

.PHONY: all clean rebuild