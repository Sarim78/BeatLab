/**
 * useWasm.js
 * BeatLab — WASM Module Loader Hook
 * Handles loading state, errors, and exposes the raw Module
 * for cases where direct access is needed beyond wasmBridge
 */

import { useState, useEffect, useRef } from "react";
import { initEngine } from "../lib/wasmBridge";

/* ─────────────────────────────────────────
   useWasm
   Returns { ready, error, loading }
   Call once at the app root — engine is a singleton
───────────────────────────────────────── */
export function useWasm() {
  const [loading, setLoading] = useState(true);
  const [ready,   setReady]   = useState(false);
  const [error,   setError]   = useState(null);
  const attempted = useRef(false);

  useEffect(() => {
    /* Guard against double-init in React strict mode */
    if (attempted.current) return;
    attempted.current = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const ok = await initEngine();

        if (ok) {
          setReady(true);
          console.log("[useWasm] Engine ready");
        } else {
          throw new Error("Engine returned false — check WASM build output");
        }
      } catch (err) {
        console.error("[useWasm] Failed to load engine:", err);
        setError(err.message ?? "Unknown error loading WASM engine");
        setReady(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ready, loading, error };
}