/*
# decoding:
# read a byte
# if it's 0xfe, it's nil (which might be same as 0)
# if it's 0xff, it's a cons box. Read two items, build cons
# otherwise, number of leading set bits is length in bytes to read size
# 0-0x7f are literal one byte values
# leading bits is the count of bytes to read of size
# 0x80-0xbf is a size of one byte (perform logical and of first byte with 0x3f to get size)
# 0xc0-0xdf is a size of two bytes (perform logical and of first byte with 0x1f)
# 0xe0-0xef is 3 bytes ((perform logical and of first byte with 0xf))
# 0xf0-0xf7 is 4 bytes ((perform logical and of first byte with 0x7))
# 0xf7-0xfb is 5 bytes ((perform logical and of first byte with 0x3))
 */
import {SExp} from "./SExp";
import {Bytes, Stream, t} from "./__type_compatibility__";
import {None} from "./__python_types__";
import {TToSexpF, TValStack} from "./as_javascript";
import {int_from_bytes, int_to_bytes} from "./casts";

const MAX_SINGLE_BYTE = 0x7F;
const CONS_BOX_MARKER = 0xFF;

type TOpStack = Array<(op_stack: TOpStack, val_stack: TValStack, f: Stream, to_sexp_f: TToSexpF) => unknown>;

export function* sexp_to_byte_iterator(sexp: SExp){
  const todo_stack = [sexp];
  while(todo_stack.length){
    sexp = todo_stack.pop() as SExp;
    const pair = sexp.as_pair();
    if(pair){
      yield int_to_bytes(CONS_BOX_MARKER);
      todo_stack.push(pair[1]);
      todo_stack.push(pair[0]);
    }
    else{
      yield* atom_to_byte_iterator(sexp.atom);
    }
  }
}

export function* atom_to_byte_iterator(atom: Bytes|None){
  const size = atom ? atom.length : 0;
  if(size === 0 || !atom){
    yield Bytes.from("0x80", "hex");
    return;
  }
  else if(size === 1){
    if(atom.get_byte_at(0) <= MAX_SINGLE_BYTE){
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
      0xF8 | ((size / 2**32) >> 0),// (size >> 32),
      ((size / 2**24) >> 0) & 0xFF,
      ((size / 2**16) >> 0) & 0xFF,
      ((size / 2**8) >> 0) & 0xFF,
      ((size / 2**0) >> 0) & 0xFF,
    ]);
  }
  else{
    throw new Error(`sexp too long ${atom}`);
  }
  const size_blob = Bytes.from(uint8array);
  
  yield size_blob;
  yield atom;
  return;
}

export function sexp_to_stream(sexp: SExp, f: Stream){
  for(const b of sexp_to_byte_iterator(sexp)){
    f.write(b);
  }
}

function _op_read_sexp(op_stack: TOpStack, val_stack: TValStack, f: Stream, to_sexp_f: TToSexpF){
  const blob = f.read(1);
  if(blob.length === 0){
    throw new Error("bad encoding");
  }
  const b = blob.get_byte_at(0);
  if(b === CONS_BOX_MARKER){
    op_stack.push(_op_cons);
    op_stack.push(_op_read_sexp);
    op_stack.push(_op_read_sexp);
    return;
  }
  val_stack.push(_atom_from_stream(f, b, to_sexp_f));
}

function _op_cons(op_stack: TOpStack, val_stack: TValStack, f: Stream, to_sexp_f: TToSexpF){
  const right = val_stack.pop() as SExp;
  const left = val_stack.pop() as SExp;
  val_stack.push(to_sexp_f(t(left, right)));
}

export function sexp_from_stream(f: Stream, to_sexp_f: TToSexpF){
  const op_stack: TOpStack = [_op_read_sexp];
  const val_stack: TValStack = [];
  
  while(op_stack.length){
    const func = op_stack.pop();
    if(func){
      func(op_stack, val_stack, f, (v: any) => new SExp(v));
    }
  }
  
  return to_sexp_f(val_stack.pop() as any);
}

function _op_consume_sexp(f: Stream){
  const blob = f.read(1);
  if(blob.length === 0){
    throw new Error("bad encoding");
  }
  const b = blob.get_byte_at(0);
  if(b === CONS_BOX_MARKER){
    return t(blob, 2);
  }
  return t(_consume_atom(f, b), 0);
}

function _consume_atom(f: Stream, b: number){
  if(b === 0x80){
    return int_to_bytes(b);
  }
  else if(b <= MAX_SINGLE_BYTE){
    return int_to_bytes(b);
  }
  
  let bit_count = 0;
  let bit_mask = 0x80;
  let ll = b;
  
  while(ll & bit_mask){
    bit_count += 1;
    ll &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }
  
  let size_blob = int_to_bytes(ll);
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
  return int_to_bytes(b).concat(size_blob.slice(1)).concat(blob);
}

/*
# instead of parsing the input stream, this function pulls out all the bytes
# that represent on S-expression tree, and returns them. This is more efficient
# than parsing and returning a python S-expression tree.
 */
export function sexp_buffer_from_stream(f: Stream){
  let ret = new Bytes();
  let depth = 1;
  while(depth > 0){
    depth -= 1;
    const [buf, d] = _op_consume_sexp(f) as [Bytes, number];
    depth += d;
    ret = ret.concat(buf);
  }
  return ret;
}

function _atom_from_stream(f: Stream, b: number, to_sexp_f: TToSexpF): SExp {
  if(b === 0x80){
    return to_sexp_f(Bytes.NULL);
  }
  else if(b <= MAX_SINGLE_BYTE){
    return to_sexp_f(int_to_bytes(b));
  }
  let bit_count = 0;
  let bit_mask = 0x80;
  while(b & bit_mask){
    bit_count += 1;
    b &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }
  let size_blob = int_to_bytes(b);
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
  return to_sexp_f(blob);
}