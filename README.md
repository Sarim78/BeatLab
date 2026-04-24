# BeatLab

A browser-based music production dashboard powered by a C audio engine compiled to WebAssembly. Built as a personal portfolio project, no backend, no server, runs entirely in the browser.

---

## ⚠️ Project Notice

> **This is a portfolio/personal project only.** It is not intended for production use, commercial deployment, or distribution. Built for learning and demonstration purposes.

---

## Stack

| Layer | Technology |
|---|---|
| UI | Next.js + React (JSX) |
| Audio Engine | C → WebAssembly (Emscripten) |
| Audio Output | Web Audio API |
| Styling | Tailwind CSS |

**No backend. No API. No server.** Everything runs client-side in the browser.

---

## Features

- 🥁 16-step beat sequencer (Kick, Snare, Hi-Hat, Clap)
- 🎚️ Mixer board with per-channel volume faders and mute controls
- ⏱️ BPM control + transport (play/pause/stop)
- 📊 Real-time waveform visualizer
- 🎹 8 sample pads with keyboard shortcuts

---

## How It Works

The audio engine is written in C and compiled to WebAssembly using Emscripten. The JS frontend loads the WASM module, calls C functions directly via the Emscripten bridge, and feeds audio buffers to the Web Audio API for playback.

```
C Engine (engine/) → Emscripten → public/beatlab.wasm → JS Bridge → React UI
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Emscripten (for rebuilding the C engine)

### Install & Run

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

### Rebuild the C Engine (optional)

```bash
cd engine
make
```

This recompiles the C source files and outputs `beatlab.wasm` and `beatlab.js` to `public/`.

---

## Project Structure

```
beatlab/
├── engine/          # C audio engine source
├── public/          # Compiled WASM output
└── src/
    ├── components/  # React UI components
    ├── hooks/       # Audio + sequencer hooks
    └── lib/         # WASM bridge + constants
```

---

## License

Personal project: not licensed for reuse or distribution.
