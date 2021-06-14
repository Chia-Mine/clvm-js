"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = exports.isIterable = exports.t = exports.Tuple2 = exports.Bytes = exports.to_hexstr = void 0;
const jscrypto_1 = require("jscrypto");
const __python_types__1 = require("./__python_types__");
function to_hexstr(i) {
    return (new jscrypto_1.Word32Array(i)).toString(jscrypto_1.Hex).replace(/^([0]{2})+|^([f]{2})+/, "");
}
exports.to_hexstr = to_hexstr;
/**
 * Unlike python, there is no immutable byte type in javascript.
 */
class Bytes {
    constructor(value) {
        if (value instanceof jscrypto_1.Word32Array) {
            this._b = value.toUint8Array();
        }
        else if (value instanceof Uint8Array) {
            this._b = new Uint8Array(value);
        }
        else if (value instanceof Bytes) {
            this._b = value.data();
        }
        else if (typeof value === "string") {
            this._b = jscrypto_1.Utf8.parse(value).toUint8Array();
        }
        else if (Array.isArray(value)) {
            const w = jscrypto_1.Hex.parse(value.map(v => v.toString(16)).join(""));
            this._b = w.toUint8Array();
        }
        else if (!value || value === __python_types__1.None) {
            this._b = new Uint8Array();
        }
        else if (typeof value.serialize === "function") {
            this._b = value.serialize();
        }
        throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }
    static from(value) {
        return new Bytes(value);
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
        return new Bytes(w);
    }
    slice(start, length) {
        const len = typeof length === "number" ? length : (this.length - start);
        return new Bytes(this._b.slice(start, start + len));
    }
    as_word() {
        return new jscrypto_1.Word32Array(this._b);
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
        return this.toString() === b.toString();
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
class Tuple2 {
    constructor(v1, v2) {
        this._value = [v1, v2];
    }
    get0() {
        return this._value[0];
    }
    get1() {
        return this._value[1];
    }
    as_array() {
        return [this.get0(), this.get1()];
    }
    toString() {
        return `(${this._value[0]}, ${this._value[1]})`;
    }
}
exports.Tuple2 = Tuple2;
function t(v1, v2) {
    return new Tuple2(v1, v2);
}
exports.t = t;
function isIterable(v) {
    if (Array.isArray(v)) {
        return true;
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
