"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sexp_buffer_from_stream = exports.sexp_from_stream = exports.sexp_to_stream = exports.atom_to_byte_iterator = exports.sexp_to_byte_iterator = void 0;
const __type_compatibility__1 = require("./__type_compatibility__");
const casts_1 = require("./casts");
const CLVMObject_1 = require("./CLVMObject");
const MAX_SINGLE_BYTE = 0x7F;
const CONS_BOX_MARKER = 0xFF;
function* sexp_to_byte_iterator(sexp) {
    const todo_stack = [sexp];
    while (todo_stack.length) {
        sexp = todo_stack.pop();
        const pair = sexp.as_pair();
        if (pair) {
            // yield Bytes.from([CONS_BOX_MARKER]);
            yield new __type_compatibility__1.Bytes(new Uint8Array([CONS_BOX_MARKER]));
            todo_stack.push(pair[1]);
            todo_stack.push(pair[0]);
        }
        else {
            yield* atom_to_byte_iterator(sexp.atom);
        }
    }
}
exports.sexp_to_byte_iterator = sexp_to_byte_iterator;
function* atom_to_byte_iterator(atom) {
    const size = atom ? atom.length : 0;
    if (size === 0 || !atom) {
        // yield Bytes.from("0x80", "hex");
        yield new __type_compatibility__1.Bytes(new Uint8Array([0x80]));
        return;
    }
    else if (size === 1) {
        if (atom.get_byte_at(0) <= MAX_SINGLE_BYTE) {
            yield atom;
            return;
        }
    }
    let uint8array;
    if (size < 0x40) {
        uint8array = Uint8Array.from([0x80 | size]);
    }
    else if (size < 0x2000) {
        uint8array = Uint8Array.from([
            0xC0 | (size >> 8),
            (size >> 0) & 0xFF,
        ]);
    }
    else if (size < 0x100000) {
        uint8array = Uint8Array.from([
            0xE0 | (size >> 16),
            (size >> 8) & 0xFF,
            (size >> 0) & 0xFF,
        ]);
    }
    else if (size < 0x8000000) {
        uint8array = Uint8Array.from([
            0xF0 | (size >> 24),
            (size >> 16) & 0xFF,
            (size >> 8) & 0xFF,
            (size >> 0) & 0xFF,
        ]);
    }
    else if (size < 0x400000000) {
        uint8array = Uint8Array.from([
            0xF8 | ((size / 2 ** 32) >> 0),
            ((size / 2 ** 24) >> 0) & 0xFF,
            ((size / 2 ** 16) >> 0) & 0xFF,
            ((size / 2 ** 8) >> 0) & 0xFF,
            ((size / 2 ** 0) >> 0) & 0xFF,
        ]);
    }
    else {
        throw new Error(`sexp too long ${atom}`);
    }
    const size_blob = new __type_compatibility__1.Bytes(uint8array);
    yield size_blob;
    yield atom;
    return;
}
exports.atom_to_byte_iterator = atom_to_byte_iterator;
function sexp_to_stream(sexp, f) {
    for (const b of sexp_to_byte_iterator(sexp)) {
        f.write(b);
    }
}
exports.sexp_to_stream = sexp_to_stream;
function _op_read_sexp(op_stack, val_stack, f, to_sexp_f) {
    const blob = f.read(1);
    if (blob.length === 0) {
        throw new Error("bad encoding");
    }
    const b = blob.get_byte_at(0);
    if (b === CONS_BOX_MARKER) {
        op_stack.push(_op_cons);
        op_stack.push(_op_read_sexp);
        op_stack.push(_op_read_sexp);
        return;
    }
    val_stack.push(_atom_from_stream(f, b, to_sexp_f));
}
function _op_cons(op_stack, val_stack, f, to_sexp_f) {
    const right = val_stack.pop();
    const left = val_stack.pop();
    val_stack.push(to_sexp_f(__type_compatibility__1.t(left, right)));
}
function sexp_from_stream(f, to_sexp_f) {
    const op_stack = [_op_read_sexp];
    const val_stack = [];
    while (op_stack.length) {
        const func = op_stack.pop();
        if (func) {
            func(op_stack, val_stack, f, ((v) => new CLVMObject_1.CLVMObject(v)));
        }
    }
    return to_sexp_f(val_stack.pop());
}
exports.sexp_from_stream = sexp_from_stream;
function _op_consume_sexp(f) {
    const blob = f.read(1);
    if (blob.length === 0) {
        throw new Error("bad encoding");
    }
    const b = blob.get_byte_at(0);
    if (b === CONS_BOX_MARKER) {
        return __type_compatibility__1.t(blob, 2);
    }
    return __type_compatibility__1.t(_consume_atom(f, b), 0);
}
function _consume_atom(f, b) {
    if (b === 0x80) {
        return __type_compatibility__1.Bytes.from([b]);
    }
    else if (b <= MAX_SINGLE_BYTE) {
        return __type_compatibility__1.Bytes.from([b]);
    }
    let bit_count = 0;
    let bit_mask = 0x80;
    let ll = b;
    while (ll & bit_mask) {
        bit_count += 1;
        ll &= 0xFF ^ bit_mask;
        bit_mask >>= 1;
    }
    let size_blob = __type_compatibility__1.Bytes.from([ll]);
    if (bit_count > 1) {
        const ll2 = f.read(bit_count - 1);
        if (ll2.length !== bit_count - 1) {
            throw new Error("bad encoding");
        }
        size_blob = size_blob.concat(ll2);
    }
    const size = casts_1.int_from_bytes(size_blob);
    if (size >= 0x400000000) {
        throw new Error("blob too large");
    }
    const blob = f.read(size);
    if (blob.length !== size) {
        throw new Error("bad encoding");
    }
    return __type_compatibility__1.Bytes.from([b]).concat(size_blob.slice(1)).concat(blob);
}
/*
# instead of parsing the input stream, this function pulls out all the bytes
# that represent on S-expression tree, and returns them. This is more efficient
# than parsing and returning a python S-expression tree.
 */
function sexp_buffer_from_stream(f) {
    const buffer = new __type_compatibility__1.Stream();
    let depth = 1;
    while (depth > 0) {
        depth -= 1;
        const [buf, d] = _op_consume_sexp(f);
        depth += d;
        buffer.write(buf);
    }
    return buffer.getValue();
}
exports.sexp_buffer_from_stream = sexp_buffer_from_stream;
function _atom_from_stream(f, b, to_sexp_f) {
    if (b === 0x80) {
        return to_sexp_f(__type_compatibility__1.Bytes.NULL);
    }
    else if (b <= MAX_SINGLE_BYTE) {
        return to_sexp_f(__type_compatibility__1.Bytes.from([b]));
    }
    let bit_count = 0;
    let bit_mask = 0x80;
    while (b & bit_mask) {
        bit_count += 1;
        b &= 0xFF ^ bit_mask;
        bit_mask >>= 1;
    }
    let size_blob = __type_compatibility__1.Bytes.from([b]);
    if (bit_count > 1) {
        const bin = f.read(bit_count - 1);
        if (bin.length !== bit_count - 1) {
            throw new Error("bad encoding");
        }
        size_blob = size_blob.concat(bin);
    }
    const size = casts_1.int_from_bytes(size_blob);
    if (size >= 0x400000000) {
        throw new Error("blob too large");
    }
    const blob = f.read(size);
    if (blob.length !== size) {
        throw new Error("bad encoding");
    }
    return to_sexp_f(blob);
}
