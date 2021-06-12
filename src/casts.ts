import {Hex} from "jscrypto";
import {int, None} from "./__python_types__";
import {Bytes} from "./__type_compatibility__";

// In javascript, max safe integer is 2**53-1 (53bit)
// Surprisingly, parseInt() can parse over 32bit integer. 
export function int_from_bytes(b: Bytes|None): int {
  if(!b){
    return 0;
  }
  return parseInt(b.as_word().toString(), 16);
}

export function int_to_bytes(v: int): Bytes {
  return new Bytes(Hex.parse(v.toString(16)));
}

/**
 * Return the number of bytes required to represent this integer.
 * @param {int} v
 */
export function limbs_for_int(v: int): int {
  return ((v < 0 ? -v : v).toString(2).length + 7) >> 3;
}
