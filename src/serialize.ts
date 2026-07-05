/*
decoding:
read a byte
if it's 0x80, it's nil (which might be same as 0)
if it's 0xfe, it's a back-reference. Read an atom, and treat it as a path in the cache tree.
if it's 0xff, it's a cons box. Read two items, build cons
otherwise, number of leading set bits is length in bytes to read size
For example, if the bit fields of the first byte read are:
  10xx xxxx -> 1 byte is allocated for size_byte, and the value of the size is 00xx xxxx
  110x xxxx -> 2 bytes are allocated for size_byte, and the value of the size 000x xxxx xxxx xxxx
  1110 xxxx -> 3 bytes allocated. The size is 0000 xxxx xxxx xxxx xxxx xxxx
  1111 0xxx -> 4 bytes allocated.
  1111 10xx -> 5 bytes allocated.
If the first byte read is one of the following:
  1000 0000 -> 0 bytes : nil
  0000 0000 -> 1 byte : zero (b'\x00')
 */
import {SExp} from "./SExp";
import {Bytes, Stream, t} from "./__type_compatibility__";
import {None} from "./__python_types__";
import {TToSexpF} from "./as_javascript";
import {bigint_from_bytes, int_from_bytes} from "./casts";
import {CLVMObject, CLVMType} from "./CLVMObject";
import {ObjectCache, treehash, serialized_length} from "./object_cache";
import {ReadCacheLookup} from "./read_cache_lookup";

const MAX_SINGLE_BYTE = 0x7F;
const BACK_REFERENCE = 0xFE;
const CONS_BOX_MARKER = 0xFF;

export const MAX_SAFE_BYTES = 2000000;

export type TSerializeOption = {
  allow_backrefs: boolean;
  max_size: number;
};

type TOpStack = Array<(op_stack: TOpStack, val_stack: CLVMType, f: Stream) => CLVMType>;

export function* sexp_to_byte_iterator(sexp: SExp, option?: Partial<Pick<TSerializeOption, "allow_backrefs">>){
  if(option && option.allow_backrefs){
    yield* sexp_to_byte_iterator_with_backrefs(sexp);
    return;
  }

  const todo_stack: CLVMType[] = [sexp];
  while(todo_stack.length){
    const s = todo_stack.pop() as CLVMType;
    const pair = s.pair;
    if(pair){
      // yield Bytes.from([CONS_BOX_MARKER]);
      yield new Bytes(new Uint8Array([CONS_BOX_MARKER]));
      todo_stack.push(pair[1]);
      todo_stack.push(pair[0]);
    }
    else{
      yield* atom_to_byte_iterator(s.atom);
    }
  }
}

export function* sexp_to_byte_iterator_with_backrefs(sexp: SExp){
  // in `read_op_stack`:
  //  "P" = "push"
  //  "C" = "pop two objects, create and push a new cons with them"

  const read_op_stack = ["P"];

  const write_stack: CLVMType[] = [sexp];

  const read_cache_lookup = new ReadCacheLookup();

  const thc = new ObjectCache<Bytes>(treehash);
  const slc = new ObjectCache<number>(serialized_length);

  while(write_stack.length){
    const node_to_write = write_stack.pop() as CLVMType;
    const op = read_op_stack.pop();
    if(op !== "P"){
      throw new Error("internal error");
    }

    const node_serialized_length = slc.get(node_to_write);

    const node_tree_hash = thc.get(node_to_write);
    const path = read_cache_lookup.find_path(node_tree_hash, node_serialized_length);
    if(path){
      yield new Bytes(new Uint8Array([BACK_REFERENCE]));
      yield* atom_to_byte_iterator(path);
      read_cache_lookup.push(node_tree_hash);
    }
    else if(node_to_write.pair){
      const [left, right] = node_to_write.pair as [CLVMType, CLVMType];
      yield new Bytes(new Uint8Array([CONS_BOX_MARKER]));
      write_stack.push(right);
      write_stack.push(left);
      read_op_stack.push("C");
      read_op_stack.push("P");
      read_op_stack.push("P");
    }
    else{
      yield* atom_to_byte_iterator(node_to_write.atom);
      read_cache_lookup.push(node_tree_hash);
    }

    while(read_op_stack[read_op_stack.length-1] === "C"){
      read_op_stack.pop();
      read_cache_lookup.pop2_and_cons();
    }
  }
}

export function* atom_to_byte_iterator(atom: Bytes|None){
  const size = atom ? atom.length : 0;
  if(size === 0 || !atom){
    // yield Bytes.from("0x80", "hex");
    yield new Bytes(new Uint8Array([0x80]));
    return;
  }
  else if(size === 1){
    if(atom.at(0) <= MAX_SINGLE_BYTE){
      yield atom;
      return;
    }
  }

  let uint8array;
  if(size < 0x40){
    uint8array = Uint8Array.from([0x80 | size]);
  }
  else if(size < 0x2000){
    uint8array = Uint8Array.from([
      0xC0 | (size >> 8),
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x100000){
    uint8array = Uint8Array.from([
      0xE0 | (size >> 16),
      (size >> 8) & 0xFF,
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x8000000){
    uint8array = Uint8Array.from([
      0xF0 | (size >> 24),
      (size >> 16) & 0xFF,
      (size >> 8) & 0xFF,
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x400000000){
    uint8array = Uint8Array.from([
      0xF8 | ((size / 2**32) | 0),// (size >> 32),
      ((size / 2**24) | 0) & 0xFF,
      ((size / 2**16) | 0) & 0xFF,
      ((size / 2**8) | 0) & 0xFF,
      ((size / 2**0) | 0) & 0xFF,
    ]);
  }
  else{
    throw new Error(`sexp too long ${atom}`);
  }
  const size_blob = new Bytes(uint8array);

  yield size_blob;
  yield atom;
  return;
}

export function sexp_to_stream(sexp: SExp, f: Stream, option?: Partial<TSerializeOption>){
  const allow_backrefs = Boolean(option && option.allow_backrefs);
  let max_size = option && typeof option.max_size === "number" ? option.max_size : MAX_SAFE_BYTES;
  for(const b of sexp_to_byte_iterator(sexp, {allow_backrefs})){
    max_size -= b.length;
    if(max_size < 0){
      throw new Error("SExp exceeds maximum size");
    }
    f.write(b);
  }
}

export function traverse_path(obj: CLVMType, path: Bytes, to_sexp: (v: Bytes) => CLVMType): CLVMType {
  let path_as_int = bigint_from_bytes(path);
  if(path_as_int === BigInt(0)){
    return to_sexp(Bytes.NULL);
  }

  while(path_as_int > BigInt(1)){
    if(!obj.pair){
      throw new Error("path into atom");
    }
    obj = obj.pair[Number(path_as_int & BigInt(1))];
    path_as_int >>= BigInt(1);
  }

  return obj;
}

// `to_sexp` used to build the intermediate value stack of `sexp_from_stream`.
// The final value is converted by the caller-provided `to_sexp_f`.
function _to_clvm_object(v: Bytes){
  return new CLVMObject(v) as CLVMType;
}

function _op_cons(op_stack: TOpStack, val_stack: CLVMType, f: Stream): CLVMType {
  if(!val_stack.pair){
    throw new Error("internal error");
  }
  const [right, val_stack_1] = val_stack.pair as [CLVMType, CLVMType];
  if(!val_stack_1.pair){
    throw new Error("internal error");
  }
  const [left, val_stack_2] = val_stack_1.pair as [CLVMType, CLVMType];
  const new_cons = new CLVMObject(t(left, right));
  return new CLVMObject(t(new_cons, val_stack_2));
}

function _op_read_sexp(op_stack: TOpStack, val_stack: CLVMType, f: Stream): CLVMType {
  const blob = f.read(1);
  if(blob.length === 0){
    throw new Error("bad encoding");
  }
  const b = blob.at(0);
  if(b === CONS_BOX_MARKER){
    op_stack.push(_op_cons);
    op_stack.push(_op_read_sexp);
    op_stack.push(_op_read_sexp);
    return val_stack;
  }
  const atom_as_sexp = _to_clvm_object(_atom_from_stream(f, b));
  return new CLVMObject(t(atom_as_sexp, val_stack));
}

function _op_read_sexp_allow_backrefs(op_stack: TOpStack, val_stack: CLVMType, f: Stream): CLVMType {
  const blob = f.read(1);
  if(blob.length === 0){
    throw new Error("bad encoding");
  }
  const b = blob.at(0);
  if(b === CONS_BOX_MARKER){
    op_stack.push(_op_cons);
    op_stack.push(_op_read_sexp_allow_backrefs);
    op_stack.push(_op_read_sexp_allow_backrefs);
    return val_stack;
  }
  if(b === BACK_REFERENCE){
    const blob2 = f.read(1);
    if(blob2.length === 0){
      throw new Error("bad encoding");
    }
    const path = _atom_from_stream(f, blob2.at(0));
    const backref = traverse_path(val_stack, path, _to_clvm_object);
    return new CLVMObject(t(backref, val_stack));
  }
  const atom_as_sexp = _to_clvm_object(_atom_from_stream(f, b));
  return new CLVMObject(t(atom_as_sexp, val_stack));
}

export function sexp_from_stream(f: Stream, to_sexp_f: TToSexpF, option?: Partial<Pick<TSerializeOption, "allow_backrefs">>){
  const op_stack: TOpStack = [
    option && option.allow_backrefs ? _op_read_sexp_allow_backrefs : _op_read_sexp,
  ];
  let val_stack: CLVMType = _to_clvm_object(Bytes.NULL);

  while(op_stack.length){
    const func = op_stack.pop();
    if(func){
      val_stack = func(op_stack, val_stack, f);
    }
  }

  if(!val_stack.pair){
    throw new Error("internal error");
  }
  return to_sexp_f(val_stack.pair[0]);
}

function _op_consume_sexp(f: Stream){
  const blob = f.read(1);
  if(blob.length === 0){
    throw new Error("bad encoding");
  }
  const b = blob.at(0);
  if(b === CONS_BOX_MARKER){
    return t(blob, 2);
  }
  return t(_consume_atom(f, b), 0);
}

function _consume_atom(f: Stream, b: number){
  if(b === 0x80){
    return Bytes.from([b]);
  }
  else if(b <= MAX_SINGLE_BYTE){
    return Bytes.from([b]);
  }

  let bit_count = 0;
  let bit_mask = 0x80;
  let ll = b;

  while(ll & bit_mask){
    bit_count += 1;
    ll &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }

  let size_blob = Bytes.from([ll]);
  if(bit_count > 1){
    const ll2 = f.read(bit_count-1);
    if(ll2.length !== bit_count-1){
      throw new Error("bad encoding");
    }
    size_blob = size_blob.concat(ll2);
  }

  const size = int_from_bytes(size_blob);
  if(size >= 0x400000000){
    throw new Error("blob too large");
  }
  const blob = f.read(size);
  if(blob.length !== size){
    throw new Error("bad encoding");
  }
  return Bytes.from([b]).concat(size_blob.subarray(1)).concat(blob);
}

/*
instead of parsing the input stream, this function pulls out all the bytes
that represent on S-expression tree, and returns them. This is more efficient
than parsing and returning a javascript S-expression tree.
 */
export function sexp_buffer_from_stream(f: Stream): Bytes {
  const buffer = new Stream();
  let depth = 1;
  while(depth > 0){
    depth -= 1;
    const [buf, d] = _op_consume_sexp(f) as [Bytes, number];
    depth += d;
    buffer.write(buf);
  }
  return buffer.getValue();
}

export function _atom_from_stream(f: Stream, b: number): Bytes {
  if(b === 0x80){
    return Bytes.NULL;
  }
  else if(b <= MAX_SINGLE_BYTE){
    return Bytes.from([b]);
  }
  let bit_count = 0;
  let bit_mask = 0x80;
  while(b & bit_mask){
    bit_count += 1;
    b &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }
  let size_blob = Bytes.from([b]);
  if(bit_count > 1){
    const bin = f.read(bit_count - 1);
    if(bin.length !== bit_count - 1){
      throw new Error("bad encoding");
    }
    size_blob = size_blob.concat(bin);
  }
  const size = int_from_bytes(size_blob);
  if(size >= 0x400000000){
    throw new Error("blob too large");
  }
  const blob = f.read(size);
  if(blob.length !== size){
    throw new Error("bad encoding");
  }
  return blob;
}
