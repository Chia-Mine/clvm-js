import type {G1Element, ModuleInstance} from "bls-signatures";
import * as blsLoader from "bls-signatures";

type TCreateModule = () => Promise<ModuleInstance>;
export let BLS: ModuleInstance | undefined;
export let loadPromise: Promise<ModuleInstance> | undefined;

/**
 * Load BLS Module instance.
 * This function must be called an awaited on program start up.
 */
export async function initializeBLS(): Promise<ModuleInstance> {
  if (BLS) {
    return BLS;
  } else if (loadPromise) {
    return loadPromise;
  }
  
  return loadPromise = new Promise<ModuleInstance>(async (resolve, reject) => {
    if (BLS) {
      loadPromise = undefined;
      return resolve(BLS);
    }
    
    let error: unknown;
    const instance = await ((blsLoader as unknown) as TCreateModule)().catch(e => {
      console.error("Error while loading BLS module");
      error = e;
      return;
    });
    
    if (error || !instance) {
      return reject(error);
    }
    
    loadPromise = undefined;
    return resolve(BLS = instance);
  });
}

/**
 * This function must be called after `initializeBLS()` is done.
 * Calling `await initializeBLS()` on program startup is library user's responsibility.
 *
 * This is used for synchronous code execution.
 * Within this library, this is always called to get BLS module to keep code synchronous.
 */
export function getBLSModule() {
  if (!BLS) {
    throw new Error("BLS module has not been loaded. Please call `await initializeBLS()` on start up");
  }
  
  return BLS;
}

export function G1Element_from_bytes(bytes: Uint8Array) {
  assert_G1Element_valid(bytes);
  const BLS = getBLSModule();
  try {
    return BLS.G1Element.from_bytes(bytes);
  } catch (e) {
    // Print exception message if debug module is enabled and loaded.
    let message = "Exception in G1Element operation";
    /*
    const get_exception_message = BLS.Util.get_exception_message;
    if (typeof get_exception_message === "function") {
      message = get_exception_message(e as number);
    }
    */
    throw new Error(message);
  }
}

export function assert_G1Element_valid(bytes: Uint8Array){
  const BLS = getBLSModule();
  const {G1Element} = BLS;
  if(bytes.length !== G1Element.SIZE){
    throw new Error("G1Element: Invalid size");
  }
  
  if((bytes[0] & 0xc0) == 0xc0){ // representing infinity
    if(bytes[0] !== 0xc0){
      throw new Error("G1Element: Given G1 infinity element must be canonical");
    }
    for(let i=1;i<G1Element.SIZE;++i){
      if(bytes[i] !== 0x00){
        throw new Error("G1Element: Given G1 infinity element must be canonical");
      }
    }
  }
  else{
    if((bytes[0] & 0xc0) !== 0x80){
      throw new Error("Given G1 non-infinity element must start with 0b10");
    }
  }
}

export function G1Element_add(g1Element1: G1Element, g1Element2: G1Element){
  const BLS = getBLSModule();
  try {
    return g1Element1.add(g1Element2);
  } catch (e) {
    // Print exception message if debug module is enabled and loaded.
    let message = "Exception in G1Element operation";
    /*
    const get_exception_message = BLS.Util.get_exception_message;
    if (typeof get_exception_message === "function") {
      message = get_exception_message(e as number);
    }
    */
    throw new Error(message);
  }
}
