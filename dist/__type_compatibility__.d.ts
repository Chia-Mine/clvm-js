import { Word32Array } from "jscrypto/Word32Array";
import { None, str } from "./__python_types__";
import { G1Element } from "@chiamine/bls-signatures";
export declare function to_hexstr(r: Uint8Array): string;
/**
 * Get python's bytes.__repr__ style string.
 * @see https://github.com/python/cpython/blob/main/Objects/bytesobject.c#L1337
 * @param {Uint8Array} r - byteArray to stringify
 */
export declare function PyBytes_Repr(r: Uint8Array): string;
export declare type BytesFromType = "hex" | "utf8" | "G1Element";
/**
 * Unlike python, there is no immutable byte type in javascript.
 */
export declare class Bytes {
    private readonly _b;
    static readonly NULL: Bytes;
    constructor(value?: Uint8Array | Bytes | None);
    static from(value?: Uint8Array | Bytes | number[] | str | G1Element | None, type?: BytesFromType): Bytes;
    static SHA256(value: str | Bytes | Uint8Array): Bytes;
    get length(): number;
    get_byte_at(i: number): number;
    concat(b: Bytes): Bytes;
    slice(start: number, length?: number): Bytes;
    as_word(): Word32Array;
    data(): Uint8Array;
    raw(): Uint8Array;
    clone(): Bytes;
    toString(): string;
    hex(): string;
    decode(): string;
    startswith(b: Bytes): boolean;
    endswith(b: Bytes): boolean;
    equal_to(b: Bytes | None): boolean;
    /**
     * Returns:
     *   +1 if argument is smaller
     *   0 if this and argument is the same
     *   -1 if argument is larger
     * @param other
     */
    compare(other: Bytes): -1 | 0 | 1;
}
export declare function b(utf8Str: str, type?: "utf8" | "hex"): Bytes;
export declare function h(hexStr: str): Bytes;
export declare class Tuple<T1, T2> extends Array<any> {
    constructor(...items: [T1, T2]);
    toString(): string;
}
export declare function t<T1, T2>(v1: T1, v2: T2): Tuple<T1, T2>;
export declare function isTuple(v: unknown): v is Tuple<unknown, unknown>;
/**
 * Check whether an argument is a list and not a tuple
 */
export declare function isList(v: unknown): v is unknown[];
export declare function isIterable(v: any): v is unknown[];
export declare class Stream {
    private _seek;
    private _bytes;
    constructor(b?: Bytes);
    get seek(): number;
    set seek(value: number);
    get length(): number;
    write(b: Bytes): number;
    read(size: number): Bytes;
    getValue(): Bytes;
}
