"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = exports.isBytes = exports.isIterable = exports.isList = exports.isTuple = exports.t = exports.Tuple = exports.list = exports.h = exports.b = exports.Bytes = exports.PyBytes_Repr = exports.to_hexstr = void 0;
const Hex_1 = require("jscrypto/Hex");
const Utf8_1 = require("jscrypto/Utf8");
const Word32Array_1 = require("jscrypto/Word32Array");
const SHA256_1 = require("jscrypto/SHA256");
const __python_types__1 = require("./__python_types__");
function to_hexstr(r) {
    return (new Word32Array_1.Word32Array(r)).toString();
}
exports.to_hexstr = to_hexstr;
/**
 * Get python's bytes.__repr__ style string.
 * @see https://github.com/python/cpython/blob/main/Objects/bytesobject.c#L1337
 * @param {Uint8Array} r - byteArray to stringify
 */
function PyBytes_Repr(r) {
    let squotes = 0;
    let dquotes = 0;
    for (let i = 0; i < r.length; i++) {
        const b = r[i];
        const c = String.fromCodePoint(b);
        switch (c) {
            case "'":
                squotes++;
                break;
            case "\"":
                dquotes++;
                break;
        }
    }
    let quote = "'";
    if (squotes && !dquotes) {
        quote = "\"";
    }
    let s = "b" + quote;
    for (let i = 0; i < r.length; i++) {
        const b = r[i];
        const c = String.fromCodePoint(b);
        if (c === quote || c === "\\") {
            s += "\\" + c;
        }
        else if (c === "\t") {
            s += "\\t";
        }
        else if (c === "\n") {
            s += "\\n";
        }
        else if (c === "\r") {
            s += "\\r";
        }
        else if (c < " " || b >= 0x7f) {
            s += "\\x";
            s += b.toString(16).padStart(2, "0");
        }
        else {
            s += c;
        }
    }
    s += quote;
    return s;
}
exports.PyBytes_Repr = PyBytes_Repr;
/**
 * Unlike python, there is no immutable byte type in javascript.
 */
class Bytes {
    constructor(value) {
        if (value instanceof Uint8Array) {
            this._b = value;
        }
        else if (isBytes(value)) {
            this._b = value.raw();
        }
        else if (!value || value === __python_types__1.None) {
            this._b = new Uint8Array();
        }
        else {
            throw new Error(`Invalid value: ${JSON.stringify(value)}`);
        }
    }
    static from(value, type) {
        if (value === __python_types__1.None || value === undefined) {
            return new Bytes(value);
        }
        else if (value instanceof Uint8Array) {
            return new Bytes(value.slice());
        }
        else if (isBytes(value)) {
            return new Bytes(value.data());
        }
        else if (Array.isArray(value) && value.every(v => typeof v === "number")) {
            if (value.some(v => (v < 0 || v > 255))) {
                throw new Error("Bytes must be in range [0, 256)");
            }
            return new Bytes(Uint8Array.from(value));
        }
        else if (typeof value === "string") {
            if (type === "hex") {
                value = value.replace(/^0x/, "");
                return new Bytes(Hex_1.Hex.parse(value).toUint8Array());
            }
            else /* if(type === "utf8") */ {
                return new Bytes(Utf8_1.Utf8.parse(value).toUint8Array());
            }
        }
        else if (type === "G1Element") {
            if (typeof value.serialize !== "function") {
                throw new Error("Invalid G1Element");
            }
            const uint8array = value.serialize();
            return new Bytes(uint8array);
        }
        throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }
    static SHA256(value) {
        let w;
        if (typeof value === "string") {
            w = SHA256_1.SHA256.hash(value);
        }
        else if (value instanceof Uint8Array) {
            w = new Word32Array_1.Word32Array(value);
            w = SHA256_1.SHA256.hash(w);
        }
        else if (isBytes(value)) {
            w = value.as_word();
            w = SHA256_1.SHA256.hash(w);
        }
        else {
            throw new Error("Invalid argument");
        }
        return new Bytes(w.toUint8Array());
    }
    get length() {
        return this._b.length;
    }
    get_byte_at(i) {
        return this._b[i] | 0;
    }
    concat(b) {
        const thisBin = this._b;
        const thatBin = b.raw();
        const concatBin = new Uint8Array(thisBin.length + thatBin.length);
        concatBin.set(thisBin, 0);
        concatBin.set(thatBin, thisBin.length);
        return new Bytes(concatBin);
    }
    repeat(n) {
        const ret = new Uint8Array(this.length * n);
        for (let i = 0; i < n; i++) {
            ret.set(this._b, i * this.length);
        }
        return new Bytes(ret);
    }
    slice(start, length) {
        const len = typeof length === "number" ? length : (this.length - start);
        return new Bytes(this._b.slice(start, start + len));
    }
    as_word() {
        return new Word32Array_1.Word32Array(this._b);
    }
    data() {
        return new Uint8Array(this._b);
    }
    raw() {
        return this._b;
    }
    clone() {
        return new Bytes(this._b.slice());
    }
    toString() {
        return PyBytes_Repr(this._b);
    }
    hex() {
        return to_hexstr(this._b);
    }
    decode() {
        return Utf8_1.Utf8.stringify(this.as_word());
    }
    startswith(b) {
        return this.hex().startsWith(b.hex());
    }
    endswith(b) {
        return this.hex().endsWith(b.hex());
    }
    equal_to(b) {
        if (b === __python_types__1.None) {
            return false;
        }
        else if (typeof b.length === "number" && isBytes(b)) {
            return this.compare(b) === 0;
        }
        else if (typeof b.equal_to === "function") {
            return b.equal_to(this);
        }
        return false;
    }
    /**
     * Returns:
     *   +1 if argument is smaller
     *   0 if this and argument is the same
     *   -1 if argument is larger
     * @param other
     */
    compare(other) {
        if (this.length !== other.length) {
            return this.length > other.length ? 1 : -1;
        }
        const dv_self = new DataView(this.raw().buffer);
        const dv_other = new DataView(other.raw().buffer);
        const ui32MaxCount = (this.length / 4) | 0;
        for (let i = 0; i < ui32MaxCount; i++) {
            const ui32_self = dv_self.getUint32(i * 4);
            const ui32_other = dv_other.getUint32(i * 4);
            if (ui32_self !== ui32_other) {
                return ui32_self > ui32_other ? 1 : -1;
            }
        }
        const offset = ui32MaxCount * 4;
        for (let i = offset; i < this.length; i++) {
            const ui8_self = dv_self.getUint8(i);
            const ui8_other = dv_other.getUint8(i);
            if (ui8_self !== ui8_other) {
                return ui8_self > ui8_other ? 1 : -1;
            }
        }
        return 0;
    }
}
exports.Bytes = Bytes;
Bytes.NULL = new Bytes();
function b(utf8Str, type = "utf8") {
    return Bytes.from(utf8Str, type);
}
exports.b = b;
function h(hexStr) {
    return Bytes.from(hexStr, "hex");
}
exports.h = h;
function list(iterable) {
    const arr = [];
    for (const item of iterable) {
        arr.push(item);
    }
    return arr;
}
exports.list = list;
class Tuple extends Array {
    constructor(...items) {
        super(...items);
        Object.freeze(this);
        return this;
    }
    toString() {
        return `(${this[0]}, ${this[1]})`;
    }
}
exports.Tuple = Tuple;
function t(v1, v2) {
    return new Tuple(v1, v2);
}
exports.t = t;
function isTuple(v) {
    return v instanceof Array && Object.isFrozen(v) && v.length === 2;
}
exports.isTuple = isTuple;
/**
 * Check whether an argument is a list and not a tuple
 */
function isList(v) {
    return Array.isArray(v) && !isTuple(v);
}
exports.isList = isList;
function isIterable(v) {
    if (Array.isArray(v)) { // Including Tuple.
        return true;
    }
    else if (typeof v === "string") {
        return false;
    }
    else if (typeof v[Symbol.iterator] === "function") {
        return true;
    }
    return false;
}
exports.isIterable = isIterable;
function isBytes(v) {
    return v && typeof v.length === "number"
        && typeof v.get_byte_at === "function"
        && typeof v.raw === "function"
        && typeof v.data === "function"
        && typeof v.hex === "function"
        && typeof v.decode === "function"
        && typeof v.equal_to === "function"
        && typeof v.compare === "function";
}
exports.isBytes = isBytes;
class Stream {
    constructor(b) {
        this._bufAllocMultiplier = 4;
        this._seek = 0;
        if (b) {
            if (b.length > Stream.INITIAL_BUFFER_SIZE) {
                this._buffer = new Uint8Array(b.length * 2);
            }
            else {
                this._buffer = new Uint8Array(Stream.INITIAL_BUFFER_SIZE);
            }
            this._buffer.set(b.raw());
            this._length = b.length;
        }
        else {
            this._buffer = new Uint8Array(Stream.INITIAL_BUFFER_SIZE);
            this._length = 0;
        }
    }
    get seek() {
        return this._seek;
    }
    set seek(value) {
        if (value < 0) {
            this._seek = this.length - 1;
        }
        else if (value > this.length - 1) {
            this._seek = this.length;
        }
        else {
            this._seek = value;
        }
    }
    get length() {
        return this._length;
    }
    reAllocate(size) {
        let s = typeof size === "number" ? size : this._buffer.length * this._bufAllocMultiplier;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_array_length
         */
        if (s > 4294967295) { // 4294967295 = 2**32 - 1
            s = 4294967295;
        }
        const buf = new Uint8Array(s);
        buf.set(this._buffer);
        this._buffer = buf;
    }
    write(b) {
        const newLength = Math.max(this.length, b.length + this._seek);
        if (newLength > this._buffer.length) {
            this.reAllocate(newLength * this._bufAllocMultiplier);
        }
        const offset = this.seek;
        this._buffer.set(b.raw(), offset);
        this._length = newLength;
        this.seek += b.length; // Don't move this line prior to `this._length = newLength`!
        return b.length;
    }
    read(size) {
        if (this.seek > this.length - 1) {
            return new Bytes(); // Return empty byte
        }
        if (this.seek + size <= this.length) {
            const u8 = this._buffer.slice(this.seek, this.seek + size);
            this.seek += size;
            return new Bytes(u8);
        }
        const u8 = new Uint8Array(this.length - this.seek);
        u8.set(this._buffer.subarray(this.seek, this.length));
        this.seek += size;
        return new Bytes(u8);
    }
    getValue() {
        return new Bytes(this._buffer.subarray(0, this.length));
    }
}
exports.Stream = Stream;
Stream.INITIAL_BUFFER_SIZE = 64 * 1024;
