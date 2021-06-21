"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = exports.isIterable = exports.t = exports.Tuple = exports.Bytes = exports.to_hexstr = void 0;
const Hex_1 = require("jscrypto/Hex");
const Utf8_1 = require("jscrypto/Utf8");
const Word32Array_1 = require("jscrypto/Word32Array");
const __python_types__1 = require("./__python_types__");
function to_hexstr(r) {
    // # make sure the string returned is minimal
    // # ie. no leading 00 or ff bytes that are unnecessary
    while (r.length > 1 && (r[0] === ((r[1] === 0xFF) ? 0xFF : 0))) {
        r = r.slice(1);
    }
    return (new Word32Array_1.Word32Array(r)).toString();
}
exports.to_hexstr = to_hexstr;
/**
 * Unlike python, there is no immutable byte type in javascript.
 */
class Bytes {
    constructor(value) {
        if (value instanceof Uint8Array) {
            this._b = new Uint8Array(value);
        }
        else if (value instanceof Bytes) {
            this._b = value.data();
        }
        else if (!value || value === __python_types__1.None) {
            this._b = new Uint8Array();
        }
        else {
            throw new Error(`Invalid value: ${JSON.stringify(value)}`);
        }
    }
    static from(value, type) {
        if (value instanceof Uint8Array || value instanceof Bytes || value === __python_types__1.None || value === undefined) {
            return new Bytes(value);
        }
        else if (value instanceof Word32Array_1.Word32Array) {
            return new Bytes(value.toUint8Array());
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
    get length() {
        return this._b.length;
    }
    get_byte_at(i) {
        return this._b[i] | 0;
    }
    concat(b) {
        const w1 = this.as_word();
        const w2 = b.as_word();
        const w = w1.concat(w2);
        return Bytes.from(w);
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
        return new Bytes(this._b);
    }
    toString() {
        return to_hexstr(this._b);
    }
    equal_to(b) {
        return this.compare(b) === 0;
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
        for (let i = 0; i < this.length; i++) {
            const self_i = this.get_byte_at(i);
            const other_i = other.get_byte_at(i);
            if (self_i === other_i) {
                continue;
            }
            return self_i > other_i ? 1 : -1;
        }
        return 0;
    }
}
exports.Bytes = Bytes;
Bytes.NULL = new Bytes();
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
class Stream {
    constructor(b) {
        this._bytes = b ? new Bytes(b) : new Bytes();
        this._seek = 0;
    }
    get seek() {
        return this._seek;
    }
    set seek(value) {
        if (value < 0) {
            this._seek = this._bytes.length - 1;
        }
        else if (value > this._bytes.length - 1) {
            this._seek = this._bytes.length;
        }
        else {
            this._seek = value;
        }
    }
    get length() {
        return this._bytes.length;
    }
    write(b) {
        const ui1 = this._bytes.data();
        const ui2 = b.data();
        const finalLength = Math.max(ui1.length, ui2.length + this._seek);
        const uint8Array = new Uint8Array(finalLength);
        const offset = this.seek;
        for (let i = 0; i < offset; i++) {
            uint8Array[i] = ui1[i];
        }
        for (let i = offset; i < finalLength; i++) {
            uint8Array[i] = ui2[i - offset] | 0;
        }
        this._bytes = new Bytes(uint8Array);
        this.seek = offset + ui2.length;
        return b.length;
    }
    read(size) {
        if (this.seek > this._bytes.length - 1) {
            return new Bytes(); // Return empty byte
        }
        const bytes = this._bytes.slice(this.seek, size);
        this.seek += size;
        return bytes;
    }
    getValue() {
        return this._bytes;
    }
}
exports.Stream = Stream;
