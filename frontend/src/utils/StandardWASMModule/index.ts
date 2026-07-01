/**
 * @uuid         UTL-WASM-001
 * @author       IzanamiiDevv
 * @time         2026-07-02 00:00
 * @dependsOn    none
 *
 * @description
 * Provides a cached WebAssembly module loader with a standard Emscripten-compatible
 * import environment. Abstracts WASM instantiation so consumers only need to supply
 * the module name, not the low-level fetch and compile pipeline.
 *
 * @whereToUse
 * Import in any feature, page, or lib module that needs to invoke compiled WASM
 * binaries served from /public/wasm/.
 *
 * @whenToUse
 * Use whenever a WASM binary must be loaded and its exports accessed at runtime.
 * Prefer this over direct WebAssembly.instantiate calls to avoid duplicate fetches
 * and to maintain a consistent import environment across the application.
 */

const cache = new Map<string, WebAssembly.Exports>()

const wasmMemory = new WebAssembly.Memory({
  initial: 256,
  maximum: 256
})

const wasmTable = new WebAssembly.Table({
  initial: 1,
  maximum: 1,
  element: "anyfunc"
})

const info: WebAssembly.Imports = {
  env: {
    __handle_overflow: () => {},
    emscripten_resize_heap: () => {},
    __lock: () => {},
    __unlock: () => {},
    __setErrNo: () => {},
    __getErrNo: () => {},
    memory: wasmMemory,
    table: wasmTable
  }
}

/**
 * @uuid         UTL-WASM-001
 * @author       IzanamiiDevv
 * @time         2026-07-02 00:00
 * @dependsOn    none
 *
 * @description
 * Fetches, compiles, and instantiates a WASM binary from /public/wasm/<name>.wasm.
 * Returns the cached exports on subsequent calls for the same name.
 */

/**
 * @uniqueid UTL-WASM-001
 *
 * Loads a WebAssembly module by name, returning its exports.
 * Results are cached in memory — repeated calls with the same name skip the fetch.
 *
 * @param name - The filename (without extension) of the .wasm binary inside /public/wasm/.
 * @returns The instantiated WebAssembly exports object.
 * @throws {TypeError} When the fetch fails or the binary is not valid WASM.
 */
export async function loadWasmModule(name: string): Promise<WebAssembly.Exports> {
  if (cache.has(name)) return cache.get(name)!
  const response = await fetch(`/wasm/${name}.wasm`)
  const bytes = await response.arrayBuffer()
  const wasm = await WebAssembly.instantiate(bytes, info)
  cache.set(name, wasm.instance.exports)
  return wasm.instance.exports
}