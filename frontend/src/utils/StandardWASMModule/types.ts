export interface WasmEnv {
  __handle_overflow: () => void
  emscripten_resize_heap: () => void
  __lock: () => void
  __unlock: () => void
  __setErrNo: () => void
  __getErrNo: () => void
  memory: WebAssembly.Memory
  table: WebAssembly.Table
}

export interface WasmImportInfo {
  env: WasmEnv
}