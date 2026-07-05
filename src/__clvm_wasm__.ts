/**
 * How to generate this file.
 * 1. Generate js interface files
 *   1.1. git clone https://github.com/Chia-Network/clvm_rs
 *   1.2. cd clvm_rs/wasm
 *   1.3. cargo install wasm-pack
 *   1.4. wasm-pack build --release --target=nodejs
 *      (or use the published `clvm_wasm` npm package, whose `clvm_wasm.js` is that output)
 * 2. Preserve loader code embedded below.
 * 3. Check functions referenced on `wasm.` in ./pkg/clvm_wasm.js and compose `ClvmWasmExports` type from them.
 * 4. Copy contents of ./pkg/clvm_wasm.js and paste here
 * 5. Annotate typings, fix lint issues
 * 6. Paste loader code preserved in the previous procedure, and make sure
 *    `wasm.__wbindgen_start()` is called right after instantiation.
 * 7. Add all `__wbg*`/`__wbindgen*` import functions to `imports["__wbindgen_placeholder__"]`.
 * 8. Add `toJSON()` method to `LazyNode`.
 */
import {Word32Array} from "jscrypto/Word32Array";

type ClvmWasmExports = {
  memory: WebAssembly.Memory;
  run_clvm(a: number, b: number, c: number, d: number, e: number): [number, number];
  run_chia_program(a: number, b: number, c: number, d: number, e: bigint, f: number): [number, number, number];
  serialized_length(a: number, b: number): [bigint, number, number];
  node_from_bytes(a: number, b: number, c: number): [number, number, number];
  __wbg_flag_free(a: number, b: number): void;
  flag_no_unknown_ops(): number;
  flag_allow_backrefs(): number;
  __wbg_lazynode_free(a: number, b: number): void;
  lazynode_pair(a: number): unknown;
  lazynode_atom(a: number): [number, number];
  lazynode_to_bytes_with_backref(a: number): [number, number, number, number];
  lazynode_to_bytes(a: number, b: number): [number, number, number, number];
  lazynode_from_bytes_with_backref(a: number, b: number): [number, number, number];
  lazynode_from_bytes(a: number, b: number): [number, number, number];
  __wbindgen_export_2: WebAssembly.Table;
  __externref_table_alloc(): number;
  __externref_table_dealloc(a: number): void;
  __wbindgen_exn_store(a: number): void;
  __wbindgen_malloc(a: number, b: number): number;
  __wbindgen_free(a: number, b: number, c: number): void;
  __wbindgen_start(): void;
}

const imports: WebAssembly.Imports = {};
let wasm: ClvmWasmExports;

const lTextDecoder = typeof TextDecoder === "undefined" ? (0, module.require)("util").TextDecoder : TextDecoder;

const cachedTextDecoder = new lTextDecoder("utf-8", {ignoreBOM: true, fatal: true});

cachedTextDecoder.decode();

function addToExternrefTable0(obj: unknown) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_export_2.set(idx, obj);
  return idx;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function handleError(this: unknown, f: Function, args: IArguments) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}

function takeFromExternrefTable0(idx: number) {
  const value = wasm.__wbindgen_export_2.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}

let cachedUint8ArrayMemory0: Uint8Array|null = null;

function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr: number, len: number) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x: unknown) {
  return x === undefined || x === null;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg: Uint8Array, malloc: (size: number, align: number) => number) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function getArrayU8FromWasm0(ptr: number, len: number) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

/**
 * @param {Uint8Array} program
 * @param {Uint8Array} args
 * @param {number} flag
 * @returns {Uint8Array}
 */
export function run_clvm(program: Uint8Array, args: Uint8Array, flag: number): Uint8Array {
  const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(args, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.run_clvm(ptr0, len0, ptr1, len1, flag);
  const v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}

/**
 * @param {Uint8Array} program
 * @param {Uint8Array} args
 * @param {bigint} max_cost
 * @param {number} flag
 * @returns {[bigint, LazyNode]}
 */
export function run_chia_program(
  program: Uint8Array,
  args: Uint8Array,
  max_cost: bigint,
  flag: number,
): [bigint, LazyNode] {
  const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(args, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.run_chia_program(ptr0, len0, ptr1, len1, max_cost, flag);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]) as [bigint, LazyNode];
}

/**
 * @param {Uint8Array} program
 * @returns {bigint}
 */
export function serialized_length(program: Uint8Array): bigint {
  const ptr0 = passArray8ToWasm0(program, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.serialized_length(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return BigInt.asUintN(64, ret[0]);
}

/**
 * @param {Uint8Array} b
 * @param {number} flag
 * @returns {LazyNode}
 */
export function node_from_bytes(b: Uint8Array, flag: number): LazyNode {
  const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.node_from_bytes(ptr0, len0, flag);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return LazyNode.__wrap(ret[0]);
}

const FlagFinalization = (typeof FinalizationRegistry === "undefined")
  ? {register: () => undefined, unregister: () => undefined}
  : new FinalizationRegistry((ptr: number) => wasm.__wbg_flag_free(ptr >>> 0, 1));

/**
 */
export class Flag {
  __wbg_ptr = 0;

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    FlagFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_flag_free(ptr, 0);
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

const LazyNodeFinalization = (typeof FinalizationRegistry === "undefined")
  ? {register: () => undefined, unregister: () => undefined}
  : new FinalizationRegistry((ptr: number) => wasm.__wbg_lazynode_free(ptr >>> 0, 1));

/**
 */
export class LazyNode {
  __wbg_ptr = 0;

  static __wrap(ptr: number) {
    ptr = ptr >>> 0;
    const obj = Object.create(LazyNode.prototype) as LazyNode;
    obj.__wbg_ptr = ptr;
    LazyNodeFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    LazyNodeFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_lazynode_free(ptr, 0);
  }

  /**
   * @returns {[LazyNode, LazyNode] | undefined}
   */
  get pair(): [LazyNode, LazyNode] | undefined {
    const ret = wasm.lazynode_pair(this.__wbg_ptr);
    return ret as [LazyNode, LazyNode] | undefined;
  }

  /**
   * @returns {Uint8Array | undefined}
   */
  get atom(): Uint8Array | undefined {
    const ret = wasm.lazynode_atom(this.__wbg_ptr);
    let v1;
    if (ret[0] !== 0) {
      v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v1;
  }

  /**
   * @returns {Uint8Array}
   */
  to_bytes_with_backref(): Uint8Array {
    const ret = wasm.lazynode_to_bytes_with_backref(this.__wbg_ptr);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }

  /**
   * @param {number} limit
   * @returns {Uint8Array}
   */
  to_bytes(limit: number): Uint8Array {
    const ret = wasm.lazynode_to_bytes(this.__wbg_ptr, limit);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    const v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }

  /**
   * @param {Uint8Array} b
   * @returns {LazyNode}
   */
  static from_bytes_with_backref(b: Uint8Array): LazyNode {
    const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lazynode_from_bytes_with_backref(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return LazyNode.__wrap(ret[0]);
  }

  /**
   * @param {Uint8Array} b
   * @returns {LazyNode}
   */
  static from_bytes(b: Uint8Array): LazyNode {
    const ptr0 = passArray8ToWasm0(b, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.lazynode_from_bytes(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return LazyNode.__wrap(ret[0]);
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

// Loader part
imports["__wbindgen_placeholder__"] = {
  __wbg_buffer_609cc3eee51ed158: function(arg0: any) {
    return arg0.buffer;
  },
  __wbg_call_672a4d21634d4a24: function(this: unknown, arg0: any, arg1: any) {
    return handleError(function(arg0: any, arg1: any) {
      return arg0.call(arg1);
    }, arguments);
  },
  __wbg_call_7cccdd69e0791ae2: function(this: unknown, arg0: any, arg1: any, arg2: any) {
    return handleError(function(arg0: any, arg1: any, arg2: any) {
      return arg0.call(arg1, arg2);
    }, arguments);
  },
  __wbg_crypto_ed58b8e10a292839: function(arg0: any) {
    return arg0.crypto;
  },
  __wbg_getRandomValues_bcb4912f16000dc4: function(this: unknown, arg0: any, arg1: any) {
    return handleError(function(arg0: any, arg1: any) {
      arg0.getRandomValues(arg1);
    }, arguments);
  },
  __wbg_lazynode_new: function(arg0: number) {
    return LazyNode.__wrap(arg0);
  },
  __wbg_msCrypto_0a36e2ec3a343d26: function(arg0: any) {
    return arg0.msCrypto;
  },
  __wbg_new_a12002a7f91c75be: function(arg0: any) {
    return new Uint8Array(arg0);
  },
  __wbg_newnoargs_105ed471475aaf50: function(arg0: number, arg1: number) {
    return new Function(getStringFromWasm0(arg0, arg1));
  },
  __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: function(arg0: any, arg1: number, arg2: number) {
    return new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
  },
  __wbg_newwithlength_a381634e90c276d4: function(arg0: number) {
    return new Uint8Array(arg0 >>> 0);
  },
  __wbg_newwithlength_c4c419ef0bc8a1f8: function(arg0: number) {
    return new Array(arg0 >>> 0);
  },
  __wbg_node_02999533c4ea02e3: function(arg0: any) {
    return arg0.node;
  },
  __wbg_process_5c1d670bc53614b8: function(arg0: any) {
    return arg0.process;
  },
  __wbg_randomFillSync_ab2cfe79ebbf2740: function(this: unknown, arg0: any, arg1: any) {
    return handleError(function(arg0: any, arg1: any) {
      arg0.randomFillSync(arg1);
    }, arguments);
  },
  __wbg_require_79b1e9274cde3c87: function(this: unknown) {
    return handleError(function() {
      return module.require;
    }, arguments);
  },
  __wbg_set_37837023f3d740e8: function(arg0: any, arg1: number, arg2: any) {
    arg0[arg1 >>> 0] = arg2;
  },
  __wbg_set_65595bdd868b3009: function(arg0: any, arg1: any, arg2: number) {
    arg0.set(arg1, arg2 >>> 0);
  },
  __wbg_static_accessor_GLOBAL_88a902d13a557d07: function() {
    const ret = typeof global === "undefined" ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  },
  __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: function() {
    const ret = typeof globalThis === "undefined" ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  },
  __wbg_static_accessor_SELF_37c5d418e4bf5819: function() {
    const ret = typeof self === "undefined" ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  },
  __wbg_static_accessor_WINDOW_5de37043a91a9c40: function() {
    const ret = typeof window === "undefined" ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  },
  __wbg_subarray_aa9065fa9dc5df96: function(arg0: any, arg1: number, arg2: number) {
    return arg0.subarray(arg1 >>> 0, arg2 >>> 0);
  },
  __wbg_versions_c71aa1626a93e0a1: function(arg0: any) {
    return arg0.versions;
  },
  __wbindgen_bigint_from_u64: function(arg0: bigint) {
    return BigInt.asUintN(64, arg0);
  },
  __wbindgen_init_externref_table: function() {
    const table = wasm.__wbindgen_export_2;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
  },
  __wbindgen_is_function: function(arg0: unknown) {
    return typeof arg0 === "function";
  },
  __wbindgen_is_object: function(arg0: unknown) {
    return typeof arg0 === "object" && arg0 !== null;
  },
  __wbindgen_is_string: function(arg0: unknown) {
    return typeof arg0 === "string";
  },
  __wbindgen_is_undefined: function(arg0: unknown) {
    return arg0 === undefined;
  },
  __wbindgen_memory: function() {
    return wasm.memory;
  },
  __wbindgen_string_new: function(arg0: number, arg1: number) {
    return getStringFromWasm0(arg0, arg1);
  },
  __wbindgen_throw: function(arg0: number, arg1: number) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  },
};

const defaultClvmRsWasmPath = (() => {
  if (typeof document !== "undefined" && document.currentScript) {
    const scriptDir = (document.currentScript as HTMLScriptElement).src.replace(/\/[^/]+$/, "");
    return scriptDir + "/clvm_wasm_bg.wasm";
  }
  return "./clvm_wasm_bg.wasm";
})();

export type TInitOption = {
  pathToWasm?: string;
  fetchOption?: RequestInit;
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
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
}
