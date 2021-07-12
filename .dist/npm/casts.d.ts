import { int, None } from "./__python_types__";
import { Bytes } from "./__type_compatibility__";
export declare function int_from_bytes(b: Bytes | None): int;
export declare function int_to_bytes(v: int): Bytes;
/**
 * Return the number of bytes required to represent this integer.
 * @param {int} v
 */
export declare function limbs_for_int(v: int): int;
