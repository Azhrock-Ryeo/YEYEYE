# Standard WASM Module

## Information

Author:     IzanamiiDevv
Time:       2026-07-02 00:00
Unique ID:  UTL-WASM-001
Scope:      wasm

## Description

Provides a cached WebAssembly module loader with a standard Emscripten-compatible
import environment. Abstracts WASM instantiation so consumers only need to supply
the module name, not the low-level fetch and compile pipeline.

## When to Use

Use whenever a WASM binary must be loaded and its exports accessed at runtime.
Prefer this over direct `WebAssembly.instantiate` calls to avoid duplicate fetches
and to maintain a consistent import environment across the application. All `.wasm`
files must be served from `/public/wasm/`.

## How to Use

```ts
import { loadWasmModule } from "@/utils/StandardWASMModule";

const exports = await loadWasmModule("image_processor");
const result = (exports.processImage as Function)(inputPtr, width, height);
```

Repeated calls with the same name return the cached exports immediately — no
additional fetch or compile occurs.

## Exported APIs

### loadWasmModule

UUID:       UTL-WASM-001
DependsOn:  none

## Notes

- The shared `WasmMemory` is fixed at 256 pages (16 MB). If a binary requires more,
  adjust `initial` and `maximum` in `index.ts` and bump the module version.
- The import env is Emscripten-compatible. Non-Emscripten WASM targets (e.g. raw
  `wasm-pack` Rust output) do not use this env and can be instantiated with `{}` as
  the import object instead — do not use this module for those.
- The in-memory cache is per page lifecycle. A full page reload clears it.
