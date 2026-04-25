# ─────────────────────────────────────────
# BeatLab — Emscripten Build Config
# Compiles C audio engine to WebAssembly
# ─────────────────────────────────────────

CC       = emcc
SOURCES  = synth.c sequencer.c mixer.c
OUTPUT   = ../public/beatlab.js
WASM_OUT = ../public/beatlab.wasm

EXPORTED_FUNCTIONS = \
	_synth_init \
	_synth_trigger \
	_synth_process \
	_synth_reset \
	_synth_get_default_voice \
	_sequencer_init \
	_sequencer_set_bpm \
	_sequencer_toggle_step \
	_sequencer_set_step \
	_sequencer_clear_pattern \
	_sequencer_tick \
	_sequencer_play \
	_sequencer_stop \
	_sequencer_reset \
	_sequencer_get_step \
	_mixer_init \
	_mixer_set_volume \
	_mixer_set_pan \
	_mixer_toggle_mute \
	_mixer_toggle_solo \
	_mixer_set_master \
	_mixer_process \
	_mixer_get_level \
	_malloc \
	_free

EXPORTED_RUNTIME = \
	ccall,cwrap,getValue,setValue,HEAPF32,HEAP32

FLAGS = \
	-O2 \
	-s WASM=1 \
	-s EXPORTED_FUNCTIONS="[$(shell echo $(EXPORTED_FUNCTIONS) | tr ' ' ',')]" \
	-s EXPORTED_RUNTIME_METHODS="[$(EXPORTED_RUNTIME)]" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT="web" \
	-s EXPORT_ES6=1 \
	-s USE_ES6_IMPORT_META=0 \
	-lm

# ─────────────────────────────────────────
# Targets
# ─────────────────────────────────────────

all: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	$(CC) $(SOURCES) $(FLAGS) -o $(OUTPUT)
	@echo "Built: $(OUTPUT)"
	@echo "Built: $(WASM_OUT)"

clean:
	rm -f $(OUTPUT) $(WASM_OUT)
	@echo "Cleaned build artifacts"

rebuild: clean all

.PHONY: all clean rebuild