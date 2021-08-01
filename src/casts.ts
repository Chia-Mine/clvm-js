import {None} from "./__python_types__";
import {Bytes, h} from "./__type_compatibility__";

// In javascript, max safe integer is 2**53-1 (53bit)
// Surprisingly, parseInt() can parse over 32bit integer. 
export function int_from_bytes(b: Bytes|None): number {
  if(!b || b.length === 0){
    return 0;
  }
  const unsigned32 = parseInt(b.hex(), 16);
  // If the first bit is 1, it is recognized as a negative number.
  if(b.at(0) & 0x80){
    return unsigned32 - (1 << (b.length*8));
  }
  return unsigned32;
}

export function int_to_bytes(v: number): Bytes {
  if(v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER){
    throw new Error(`The int value is beyond ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
  }
  if(v === 0){
    return Bytes.NULL;
  }
  
  const byte_count = ((v < 0 ? -v : v).toString(2).length + 8) >> 3;
  let hexStr = (v >>> 0).toString(16);
  if(v >= 0){
    hexStr = hexStr.length % 2 ? `0${hexStr}` : hexStr;
  }
  while(hexStr.length / 2 < byte_count){
    hexStr = "00" + hexStr;
  }
  
  while(hexStr.length > 2 && hexStr.substr(0, 2) === (parseInt(hexStr.substr(2, 2), 16) & 0x80 ? "ff" : "00")){
    hexStr = hexStr.substr(2);
  }
  
  return h(hexStr);
}

/**
 * Return the number of bytes required to represent this integer.
 * @param {number} v
 */
export function limbs_for_int(v: number): number {
  return ((v < 0 ? -v : v).toString(2).length + 7) >> 3;
}
