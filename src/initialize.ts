import blsLoader, {ModuleInstance} from "bls-signatures";

let BLS: ModuleInstance | undefined;
let loadPromise: Promise<ModuleInstance>|undefined;

/**
 * Load BLS Module instance.
 * This function must be called an awaited on program start up.
 */
export async function initializeBLS(): Promise<ModuleInstance> {
  if(BLS){
    return BLS;
  }
  else if(loadPromise){
    return loadPromise;
  }
  
  return loadPromise = new Promise<ModuleInstance>(async (resolve, reject) => {
    if (BLS) {
      loadPromise = undefined;
      return resolve(BLS);
    }
  
    let error: unknown;
    const instance = await blsLoader().catch(e => {
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
export function getBLSModule(){
  if(!BLS){
    throw new Error("BLS module has not been loaded. Please call `await initializeBLS()` on start up");
  }
  
  return BLS;
}
