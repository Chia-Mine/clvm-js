"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limbs_for_int = exports.int_to_bytes = exports.int_from_bytes = void 0;
const jscrypto_1 = require("jscrypto");
const __type_compatibility__1 = require("./__type_compatibility__");
// In javascript, max safe integer is 2**53-1 (53bit)
// Surprisingly, parseInt() can parse over 32bit integer. 
function int_from_bytes(b) {
    if (!b) {
        return 0;
    }
    return parseInt(b.as_word().toString(), 16);
}
exports.int_from_bytes = int_from_bytes;
function int_to_bytes(v) {
    if (v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER) {
        throw new Error(`int value go over ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
    }
    return new __type_compatibility__1.Bytes(jscrypto_1.Hex.parse(v.toString(16).padStart(2, "0")));
}
exports.int_to_bytes = int_to_bytes;
/**
 * Return the number of bytes required to represent this integer.
 * @param {int} v
 */
function limbs_for_int(v) {
    return ((v < 0 ? -v : v).toString(2).length + 7) >> 3;
}
exports.limbs_for_int = limbs_for_int;
