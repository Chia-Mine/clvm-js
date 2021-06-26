import {int, None} from "./__python_types__";
import {Bytes} from "./__type_compatibility__";

// In javascript, max safe integer is 2**53-1 (53bit)
// Surprisingly, parseInt() can parse over 32bit integer. 
export function int_from_bytes(b: Bytes|None): int {
  if(!b || b.length === 0){
    return 0;
  }
  return parseInt(b.as_word().toString(), 16);
}

export function int_to_bytes(v: int): Bytes {
  if(v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER){
    throw new Error(`int value go over ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
  }
  if(v === 0){
    return Bytes.NULL;
  }
  else if(v > 0){
    let hexStr = v.toString(16);
    hexStr = hexStr.length % 2 ? "0" + hexStr : hexStr;
    return Bytes.from(hexStr, "hex");
  }
  else if(v >= -(2**32 - 1)){
    return Bytes.from((v >>> 0).toString(16), "hex");
  }
  // if v is minus and over 32bit, split value into high and low bits.
  const highBits = (v / 2**32) >>> 0;
  const lowBits = v >>> 0;
  const highHexStr = highBits.toString(16).length % 2 ? "0" + highBits.toString(16) : highBits.toString(16);
  const lowHexStr = lowBits.toString(16).length % 2 ? "0" + lowBits.toString(16) : lowBits.toString(16);
  const hexStr = highHexStr + lowHexStr;
  return Bytes.from(hexStr, "hex");
}

/**
 * Return the number of bytes required to represent this integer.
 * @param {int} v
 */
export function limbs_for_int(v: int): int {
  return ((v < 0 ? -v : v).toString(2).length + 7) >> 3;
}
