import { Word32Array } from "jscrypto";
import { int, None, str } from "./__python_types__";
import { G1Element } from "bls-signatures";
export declare function to_hexstr(i: Uint8Array): string;
/**
 * Unlike python, there is no immutable byte type in javascript.
 */
export declare class Bytes {
    private readonly _b;
    static readonly NULL: Bytes;
    static from(value?: Word32Array | Uint8Array | Bytes | str | int[] | G1Element | None): Bytes;
    constructor(value?: Word32Array | Uint8Array | Bytes | str | int[] | G1Element | None);
    get length(): number;
    get_byte_at(i: number): number;
    concat(b: Bytes): Bytes;
    slice(start: number, length?: number): Bytes;
    as_word(): Word32Array;
    data(): Uint8Array;
    raw(): Uint8Array;
    clone(): Bytes;
    toString(): string;
    equal_to(b: Bytes): boolean;
    /**
     * Returns:
     *   +1 if argument is smaller
     *   0 if this and argument is the same
     *   -1 if argument is larger
     * @param other
     */
    compare(other: Bytes): -1 | 0 | 1;
}
export declare class Tuple2<T1, T2> {
    private readonly _value;
    constructor(v1: T1, v2: T2);
    get0(): T1;
    get1(): T2;
    as_array(): (T1 | T2)[];
    toString(): string;
}
export declare function t<T1, T2>(v1: T1, v2: T2): Tuple2<T1, T2>;
export declare function isIterable(v: any): v is Array<unknown>;
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
