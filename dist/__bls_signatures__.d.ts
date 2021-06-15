import type { G1Element, ModuleInstance } from "bls-signatures";
export declare let BLS: ModuleInstance | undefined;
export declare let loadPromise: Promise<ModuleInstance> | undefined;
/**
 * Load BLS Module instance.
 * This function must be called an awaited on program start up.
 */
export declare function initializeBLS(): Promise<ModuleInstance>;
/**
 * This function must be called after `initializeBLS()` is done.
 * Calling `await initializeBLS()` on program startup is library user's responsibility.
 *
 * This is used for synchronous code execution.
 * Within this library, this is always called to get BLS module to keep code synchronous.
 */
export declare function getBLSModule(): ModuleInstance;
export declare function G1Element_from_bytes(bytes: Uint8Array): G1Element;
export declare function assert_G1Element_valid(bytes: Uint8Array): void;
export declare function G1Element_add(g1Element1: G1Element, g1Element2: G1Element): G1Element;
