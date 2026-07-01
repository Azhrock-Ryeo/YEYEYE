const cache = new Map<string, WebAssembly.Exports>();

const wasmMemory = new WebAssembly.Memory({
    initial: 256,
    maximum: 256
});

const wasmTable = new WebAssembly.Table({
    initial: 1,
    maximum: 1,
    element: "anyfunc"
});

const info = {
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
};

/**
 * Loads a WebAssembly module by name.
 *
 * @export
 * @async
 * @param {string} name 
 * @returns {Promise<WebAssembly.Exports>} 
 */
export async function loadWasmModule(name: string): Promise<WebAssembly.Exports> {
    if (cache.has(name)) return cache.get(name)!;
    const response = await fetch(`/wasm/${name}.wasm`);
    const bytes = await response.arrayBuffer();
    const wasm = await WebAssembly.instantiate(bytes, info);
    cache.set(name, wasm.instance.exports);
    return wasm.instance.exports;
}