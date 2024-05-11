/**
 * How to generate this file.
 * 1. Generate js interface files
 *   1.1. git clone https://github.com/Chia-Network/clvm_rs
 *   1.2. cd clvm_rs/wasm
 *   1.3. cargo install wasm-pack
 *   1.4. wasm-pack build --release --target=bundler
 * 2. Preserve loader code embedded below.
 * 3. Check contents of ./pkg/clvm_wasm_bg.wasm.d.ts and compose `ClvmWasmExports` type from it.
 * 3. Copy contents of ./pkg/clvm_wasm_bg.js and paste here
 * 4. Annotate typings, fix lint issues
 * 5. Paste loader code preserved in the previous procedure
 * 6. Add `__wb*` functions to the `imports` object.
 * 7. Add `toJSON()` method to `LazyNode`.
 */
import {Word32Array} from "jscrypto/Word32Array";

type ClvmWasmExports = {
  memory: WebAssembly.Memory;
  serialized_length(a: number, b: number, c: number): void;
  node_from_bytes(a: number, b: number, c: number, d: number): void;
  __wbg_flag_free(a: number): void;
  flag_no_unknown_ops(): number;
  flag_allow_backrefs(): number;
  run_clvm(a: number, b: number, c: number, d: number, e: number, f: number): void;
  run_chia_program(a: number, b: number, c: number, d: number, e: number, f: bigint, g: number): void;
  __wbg_lazynode_free(a: number): void;
  lazynode_pair(a: number): number;
  lazynode_atom(a: number, b: number): void;
  lazynode_to_bytes_with_backref(a: number, b: number): void;
  lazynode_to_bytes(a: number, b: number, c: number): void;
  lazynode_from_bytes_with_backref(a: number, b: number, c: number): void;
  lazynode_from_bytes(a: number, b: number, c: number): void;
  __wbindgen_add_to_stack_pointer(a: number): number;
  __wbindgen_malloc(a: number, b: number): number;
  __wbindgen_free(a: number, b: number, c?: number): void;
}

const imports: WebAssembly.Imports = {};
let wasm: ClvmWasmExports;


const lTextDecoder = typeof TextDecoder === "undefined" ? (0, module.require)("util").TextDecoder : TextDecoder;

const cachedTextDecoder = new lTextDecoder("utf-8", {ignoreBOM: true, fatal: true});

cachedTextDecoder.decode();

let cachedUint8Memory0: Uint8Array|null = null;

function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr: number, len: number) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj: any) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  
  heap[idx] = obj;
  return idx;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg: Uint8Array, malloc: (size: number, align: number) => number) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

let cachedBigInt64Memory0: BigInt64Array|null = null;

function getBigInt64Memory0() {
  if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
    cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
  }
  return cachedBigInt64Memory0;
}

let cachedInt32Memory0: Int32Array|null = null;

function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

function getObject(idx: number) {
  return heap[idx];
}

function dropObject(idx: number) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx: number) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

/**
 * @param {Uint8Array} program
 * @returns {bigint}
 */
export function serialized_length(program: Uint8Array): bigint {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.serialized_length(retptr, ptr0, len0);
    const r0 = getBigInt64Memory0()[retptr / 8 + 0];
    const r2 = getInt32Memory0()[retptr / 4 + 2];
    const r3 = getInt32Memory0()[retptr / 4 + 3];
    if (r3) {
      throw takeObject(r2);
    }
    return BigInt.asUintN(64, r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Uint8Array} b
 * @param {number} flag
 * @returns {LazyNode}
 */
export function node_from_bytes(b: Uint8Array, flag: number): LazyNode {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.node_from_bytes(retptr, ptr0, len0, flag);
    const r0 = getInt32Memory0()[retptr / 4 + 0];
    const r1 = getInt32Memory0()[retptr / 4 + 1];
    const r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return LazyNode.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

function getArrayU8FromWasm0(ptr: number, len: number) {
  ptr = ptr >>> 0;
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

/**
 * @param {Uint8Array} program
 * @param {Uint8Array} args
 * @param {number} flag
 * @returns {Uint8Array}
 */
export function run_clvm(program: Uint8Array, args: Uint8Array, flag: number): Uint8Array {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(args, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    wasm.run_clvm(retptr, ptr0, len0, ptr1, len1, flag);
    const r0 = getInt32Memory0()[retptr / 4 + 0];
    const r1 = getInt32Memory0()[retptr / 4 + 1];
    const v3 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v3;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Uint8Array} program
 * @param {Uint8Array} args
 * @param {bigint} max_cost
 * @param {number} flag
 * @returns {[bigint, any]}
 */
export function run_chia_program(
  program: Uint8Array,
  args: Uint8Array,
  max_cost: bigint,
  flag: number,
): [bigint, LazyNode] {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(args, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    wasm.run_chia_program(retptr, ptr0, len0, ptr1, len1, max_cost, flag);
    const r0 = getInt32Memory0()[retptr / 4 + 0];
    const r1 = getInt32Memory0()[retptr / 4 + 1];
    const r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 */
export class Flag {
  __wbg_ptr = 0;
  
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    
    return ptr;
  }
  
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_flag_free(ptr);
  }
  
  /**
   * @returns {number}
   */
  static no_unknown_ops(): number {
    const ret = wasm.flag_no_unknown_ops();
    return ret >>> 0;
  }
  
  /**
   * @returns {number}
   */
  static allow_backrefs(): number {
    const ret = wasm.flag_allow_backrefs();
    return ret >>> 0;
  }
}

/**
 */
export class LazyNode {
  __wbg_ptr = 0;
  
  static __wrap(ptr: number) {
    ptr = ptr >>> 0;
    const obj = Object.create(LazyNode.prototype);
    obj.__wbg_ptr = ptr;
    
    return obj;
  }
  
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    
    return ptr;
  }
  
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_lazynode_free(ptr);
  }
  
  /**
   * @returns {Array<any> | undefined}
   */
  get pair(): [LazyNode, LazyNode] | undefined {
    const ret = wasm.lazynode_pair(this.__wbg_ptr);
    return takeObject(ret);
  }
  
  /**
   * @returns {Uint8Array | undefined}
   */
  get atom(): Uint8Array | undefined {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.lazynode_atom(retptr, this.__wbg_ptr);
      const r0 = getInt32Memory0()[retptr / 4 + 0];
      const r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  
  /**
   * @returns {Uint8Array}
   */
  to_bytes_with_backref(): Uint8Array {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.lazynode_to_bytes_with_backref(retptr, this.__wbg_ptr);
      const r0 = getInt32Memory0()[retptr / 4 + 0];
      const r1 = getInt32Memory0()[retptr / 4 + 1];
      const r2 = getInt32Memory0()[retptr / 4 + 2];
      const r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      const v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  
  /**
   * @param {number} limit
   * @returns {Uint8Array}
   */
  to_bytes(limit: number): Uint8Array {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.lazynode_to_bytes(retptr, this.__wbg_ptr, limit);
      const r0 = getInt32Memory0()[retptr / 4 + 0];
      const r1 = getInt32Memory0()[retptr / 4 + 1];
      const r2 = getInt32Memory0()[retptr / 4 + 2];
      const r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      const v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_free(r0, r1 * 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  
  /**
   * @param {Uint8Array} b
   * @returns {LazyNode}
   */
  static from_bytes_with_backref(b: Uint8Array): LazyNode {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.lazynode_from_bytes_with_backref(retptr, ptr0, len0);
      const r0 = getInt32Memory0()[retptr / 4 + 0];
      const r1 = getInt32Memory0()[retptr / 4 + 1];
      const r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return LazyNode.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  
  /**
   * @param {Uint8Array} b
   * @returns {LazyNode}
   */
  static from_bytes(b: Uint8Array): LazyNode {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.lazynode_from_bytes(retptr, ptr0, len0);
      const r0 = getInt32Memory0()[retptr / 4 + 0];
      const r1 = getInt32Memory0()[retptr / 4 + 1];
      const r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return LazyNode.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  
  toJSON() {
    if(this.pair){
      return this.pair;
    }
    if(this.atom){
      return (new Word32Array(this.atom)).toString();
    }
    throw new Error("Invalid object");
  }
}

export function __wbg_lazynode_new(arg0: number) {
  const ret = LazyNode.__wrap(arg0);
  return addHeapObject(ret);
}

export function __wbindgen_string_new(arg0: number, arg1: number) {
  const ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
}

export function __wbindgen_bigint_from_u64(arg0: bigint) {
  const ret = BigInt.asUintN(64, arg0);
  return addHeapObject(ret);
}

export function __wbg_newwithlength_3ec098a360da1909(arg0: number) {
  const ret = new Array(arg0 >>> 0);
  return addHeapObject(ret);
}

export function __wbg_set_502d29070ea18557(arg0: number, arg1: number, arg2: number) {
  getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
}

export function __wbindgen_throw(arg0: number, arg1: number) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}


// Loader part
imports["__wbindgen_placeholder__"] = {
  __wbg_lazynode_new,
  __wbindgen_string_new,
  __wbindgen_bigint_from_u64,
  __wbg_newwithlength_3ec098a360da1909,
  __wbg_set_502d29070ea18557,
  __wbindgen_throw,
};

const defaultClvmRsWasmPath = (() => {
  if (typeof document !== "undefined" && document.currentScript) {
    const scriptDir = (document.currentScript as HTMLScriptElement).src.replace(/\/[^/]+$/, "");
    return scriptDir + "/clvm_wasm_bg.wasm";
  } else {
    return "./clvm_wasm_bg.wasm";
  }
})();

export type TInitOption = {
  pathToWasm: string;
  fetchOption: RequestInit;
}

export async function initializeClvmWasm(option?: TInitOption) {
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require.resolve("clvm_wasm/clvm_wasm_bg.wasm");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytes = require("fs").readFileSync(path);
    
    const wasmModule = new WebAssembly.Module(bytes);
    const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
    wasm = wasmInstance.exports as ClvmWasmExports;
  } else {
    let url;
    if (option && option.pathToWasm) {
      url = option.pathToWasm;
    } else {
      url = defaultClvmRsWasmPath;
    }
    const fetcher = fetch(url, option && option.fetchOption);
    const wasmInstance = await WebAssembly.instantiateStreaming(fetcher, imports);
    wasm = wasmInstance.instance.exports as ClvmWasmExports;
  }
}
