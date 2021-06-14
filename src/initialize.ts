import {initializeBLS} from "./__bls_signatures__";

/**
 * Always call and wait this async function to be finished to initialize async bls module loading.
 */
export async function initialize(){
  await initializeBLS();
}
