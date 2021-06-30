"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SExp = exports.to_sexp_type = exports.convert_atom_to_bytes = exports.looks_like_clvm_object = void 0;
const __python_types__1 = require("./__python_types__");
const CLVMObject_1 = require("./CLVMObject");
const __type_compatibility__1 = require("./__type_compatibility__");
const casts_1 = require("./casts");
const serialize_1 = require("./serialize");
const as_javascript_1 = require("./as_javascript");
const EvalError_1 = require("./EvalError");
function looks_like_clvm_object(o) {
    if (!o || typeof o !== "object") {
        return false;
    }
    return Boolean("atom" in o && "pair" in o);
}
exports.looks_like_clvm_object = looks_like_clvm_object;
// this function recognizes some common types and turns them into plain bytes
function convert_atom_to_bytes(v) {
    if (v instanceof __type_compatibility__1.Bytes) {
        return v;
    }
    else if (typeof v === "string") {
        return __type_compatibility__1.Bytes.from(v, "utf8");
    }
    else if (typeof v === "number") {
        return casts_1.int_to_bytes(v);
    }
    else if (v === __python_types__1.None || !v) {
        return __type_compatibility__1.Bytes.NULL;
    }
    else if (__type_compatibility__1.isIterable(v)) {
        if (v.length > 0) {
            throw new Error(`can't cast ${JSON.stringify(v)} to bytes`);
        }
        return __type_compatibility__1.Bytes.NULL;
    }
    else if (typeof v.serialize === "function") {
        return __type_compatibility__1.Bytes.from(v, "G1Element");
    }
    throw new Error(`can't cast ${JSON.stringify(v)} to bytes`);
}
exports.convert_atom_to_bytes = convert_atom_to_bytes;
const op_convert = 0;
const op_set_left = 1;
const op_set_right = 2;
const op_prepend_list = 3;
function to_sexp_type(value) {
    let v = value;
    const stack = [v];
    const ops = [__type_compatibility__1.t(0, __python_types__1.None)];
    while (ops.length) {
        const item = ops.pop();
        const op = item[0];
        let targetIndex = item[1];
        // convert value
        if (op === op_convert) {
            if (looks_like_clvm_object(stack[stack.length - 1])) {
                continue;
            }
            v = stack.pop();
            if (v instanceof __type_compatibility__1.Tuple) {
                if (v.length !== 2) {
                    throw new Error(`can't cast tuple of size ${v.length}`);
                }
                const [left, right] = v;
                targetIndex = stack.length;
                stack.push(new CLVMObject_1.CLVMObject(__type_compatibility__1.t(left, right)));
                if (!looks_like_clvm_object(right)) {
                    stack.push(right);
                    ops.push(__type_compatibility__1.t(2, targetIndex)); // set right
                    ops.push(__type_compatibility__1.t(0, __python_types__1.None)); // convert
                }
                if (!looks_like_clvm_object(left)) {
                    stack.push(left);
                    ops.push(__type_compatibility__1.t(1, targetIndex));
                    ops.push(__type_compatibility__1.t(0, __python_types__1.None));
                }
                continue;
            }
            else if (Array.isArray(v) /* && !(v instance of Tuple) */) {
                targetIndex = stack.length;
                stack.push(new CLVMObject_1.CLVMObject(__type_compatibility__1.Bytes.NULL));
                for (const _ of v) {
                    stack.push(_);
                    ops.push(__type_compatibility__1.t(3, targetIndex)); // prepend list
                    // we only need to convert if it's not already the right type
                    if (!looks_like_clvm_object(_)) {
                        ops.push(__type_compatibility__1.t(0, __python_types__1.None)); // convert
                    }
                }
                continue;
            }
            stack.push(new CLVMObject_1.CLVMObject(convert_atom_to_bytes(v)));
            continue;
        }
        if (targetIndex === null) {
            throw new Error("Invalid target. target is null");
        }
        if (op === op_set_left) { // set left
            stack[targetIndex].pair = __type_compatibility__1.t(new CLVMObject_1.CLVMObject(stack.pop()), stack[targetIndex].pair[1]);
        }
        else if (op === op_set_right) { // set right
            stack[targetIndex].pair = __type_compatibility__1.t(stack[targetIndex].pair[0], new CLVMObject_1.CLVMObject(stack.pop()));
        }
        else if (op === op_prepend_list) { // prepend list
            stack[targetIndex] = new CLVMObject_1.CLVMObject(__type_compatibility__1.t(stack.pop(), stack[targetIndex]));
        }
    }
    // there's exactly one item left at this point
    if (stack.length !== 1) {
        throw new Error("internal error");
    }
    // stack[0] implements the clvm object protocol and can be wrapped by an SExp
    return stack[0];
}
exports.to_sexp_type = to_sexp_type;
/*
 SExp provides higher level API on top of any object implementing the CLVM
 object protocol.
 The tree of values is not a tree of SExp objects, it's a tree of CLVMObject
 like objects. SExp simply wraps them to privide a uniform view of any
 underlying conforming tree structure.
 
 The CLVM object protocol (concept) exposes two attributes:
 1. "atom" which is either None or bytes
 2. "pair" which is either None or a tuple of exactly two elements. Both
 elements implementing the CLVM object protocol.
 Exactly one of "atom" and "pair" must be None.
 */
class SExp extends CLVMObject_1.CLVMObject {
    constructor(v) {
        super(v);
        this.atom = v.atom;
        this.pair = v.pair;
    }
    static to(v) {
        if (v instanceof SExp) {
            return v;
        }
        if (looks_like_clvm_object(v)) {
            return new SExp(v);
        }
        // this will lazily convert elements
        return new SExp(to_sexp_type(v));
    }
    static null() {
        return SExp.__NULL__;
    }
    as_pair() {
        const pair = this.pair;
        if (pair === __python_types__1.None) {
            return pair;
        }
        return __type_compatibility__1.t(new SExp(pair[0]), new SExp(pair[1]));
    }
    listp() {
        return this.pair !== __python_types__1.None;
    }
    nullp() {
        return this.atom !== __python_types__1.None && this.atom.raw().length === 0;
    }
    as_int() {
        return casts_1.int_from_bytes(this.atom);
    }
    as_bin() {
        const f = new __type_compatibility__1.Stream();
        serialize_1.sexp_to_stream(this, f);
        return f.getValue();
    }
    cons(right) {
        return SExp.to(__type_compatibility__1.t(this, right));
    }
    first() {
        const pair = this.pair;
        if (pair) {
            return new SExp(pair[0]);
        }
        throw new EvalError_1.EvalError("first of non-cons", this);
    }
    rest() {
        const pair = this.pair;
        if (pair) {
            return new SExp(pair[1]);
        }
        throw new EvalError_1.EvalError("rest of non-cons", this);
    }
    *as_iter() {
        let v = this;
        while (!v.nullp()) {
            yield v.first();
            v = v.rest();
        }
    }
    equal_to(other) {
        try {
            other = SExp.to(other);
            const to_compare_stack = [__type_compatibility__1.t(this, other)];
            while (to_compare_stack.length) {
                const [s1, s2] = to_compare_stack.pop();
                const p1 = s1.as_pair();
                if (p1) {
                    const p2 = s2.as_pair();
                    if (p2) {
                        to_compare_stack.push(__type_compatibility__1.t(p1[0], p2[0]));
                        to_compare_stack.push(__type_compatibility__1.t(p1[1], p2[1]));
                    }
                    else {
                        return false;
                    }
                }
                else if (s2.as_pair() || !(s1.atom && s2.atom && s1.atom.equal_to(s2.atom))) {
                    return false;
                }
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    list_len() {
        let v = this;
        let size = 0;
        while (v.listp()) {
            size += 1;
            v = v.rest();
        }
        return size;
    }
    as_javascript() {
        return as_javascript_1.as_javascript(this);
    }
    toString() {
        return this.as_bin().toString();
    }
    __repr__() {
        return `SExp(${this.as_bin().toString()})`;
    }
}
exports.SExp = SExp;
SExp.TRUE = new SExp(new CLVMObject_1.CLVMObject(__type_compatibility__1.Bytes.from("0x01", "hex")));
SExp.FALSE = new SExp(new CLVMObject_1.CLVMObject(__type_compatibility__1.Bytes.NULL));
SExp.__NULL__ = new SExp(new CLVMObject_1.CLVMObject(__type_compatibility__1.Bytes.NULL));
