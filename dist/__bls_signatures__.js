"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.G1Element_add = exports.assert_G1Element_valid = exports.G1Element_from_bytes = exports.getBLSModule = exports.initializeBLS = exports.loadPromise = exports.BLS = void 0;
const blsLoader = require("@chiamine/bls-signatures");
/**
 * Load BLS Module instance.
 * This function must be called an awaited on program start up.
 */
function initializeBLS() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.BLS) {
            return exports.BLS;
        }
        else if (exports.loadPromise) {
            return exports.loadPromise;
        }
        return exports.loadPromise = new Promise((resolve, reject) => {
            if (exports.BLS) {
                exports.loadPromise = undefined;
                return resolve(exports.BLS);
            }
            blsLoader().then((instance) => {
                if (!instance) {
                    return reject();
                }
                exports.loadPromise = undefined;
                return resolve(exports.BLS = instance);
            }).catch(e => {
                console.error("Error while loading BLS module");
                return reject(e);
            });
        });
    });
}
exports.initializeBLS = initializeBLS;
/**
 * This function must be called after `initializeBLS()` is done.
 * Calling `await initializeBLS()` on program startup is library user's responsibility.
 *
 * This is used for synchronous code execution.
 * Within this library, this is always called to get BLS module to keep code synchronous.
 */
function getBLSModule() {
    if (!exports.BLS) {
        throw new Error("BLS module has not been loaded. Please call `await initializeBLS()` on start up");
    }
    return exports.BLS;
}
exports.getBLSModule = getBLSModule;
function G1Element_from_bytes(bytes) {
    assert_G1Element_valid(bytes);
    const BLSModule = getBLSModule();
    try {
        return BLSModule.G1Element.from_bytes(bytes);
    }
    catch (e) {
        // Print exception message if debug module is enabled and loaded.
        const message = "Exception in G1Element operation";
        /*
        const get_exception_message = BLS.Util.get_exception_message;
        if (typeof get_exception_message === "function") {
          message = get_exception_message(e as number);
        }
        */
        throw new Error(message);
    }
}
exports.G1Element_from_bytes = G1Element_from_bytes;
function assert_G1Element_valid(bytes) {
    const BLSModule = getBLSModule();
    const { G1Element } = BLSModule;
    if (bytes.length !== G1Element.SIZE) {
        throw new Error("G1Element: Invalid size");
    }
    if ((bytes[0] & 0xc0) === 0xc0) { // representing infinity
        if (bytes[0] !== 0xc0) {
            throw new Error("G1Element: Given G1 infinity element must be canonical");
        }
        for (let i = 1; i < G1Element.SIZE; ++i) {
            if (bytes[i] !== 0x00) {
                throw new Error("G1Element: Given G1 infinity element must be canonical");
            }
        }
    }
    else {
        if ((bytes[0] & 0xc0) !== 0x80) {
            throw new Error("Given G1 non-infinity element must start with 0b10");
        }
    }
}
exports.assert_G1Element_valid = assert_G1Element_valid;
function G1Element_add(g1Element1, g1Element2) {
    try {
        return g1Element1.add(g1Element2);
    }
    catch (e) {
        // Print exception message if debug module is enabled and loaded.
        const message = "Exception in G1Element operation";
        /*
        const get_exception_message = BLS.Util.get_exception_message;
        if (typeof get_exception_message === "function") {
          message = get_exception_message(e as number);
        }
        */
        throw new Error(message);
    }
}
exports.G1Element_add = G1Element_add;
