import {initializeBLS} from "./__bls_signatures__";
import {initializeClvmWasm} from "./__clvm_wasm__";

/**
 * Always call and wait this async function to be finished to initialize async bls module loading.
 */
export async function initialize(){
  await Promise.all([initializeBLS(), initializeClvmWasm()]);
}
